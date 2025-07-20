import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";
import { UserController } from "../controllers/UserController";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("Environment variable GOOGLE_CLIENT_ID not provided");
}

if (!process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Environment variable GOOGLE_CLIENT_SECRET not provided");
}

if (!process.env.BASE_URL) {
  throw new Error("Environment variable BASE_URL not provided");
}

function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for sessions (works great with SQLite as main DB)
  const memoryStore = MemoryStore(session);
  const sessionStore = new memoryStore({
    checkPeriod: sessionTtl, // prune expired entries every 24h
  });
  
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

interface GoogleProfile {
  id: string;
  displayName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  emails: Array<{
    value: string;
    verified: boolean;
  }>;
  photos: Array<{
    value: string;
  }>;
}

async function upsertUser(profile: GoogleProfile) {
  await UserController.upsertUser({
    id: profile.id,
    email: profile.emails[0]?.value,
    firstName: profile.name?.givenName,
    lastName: profile.name?.familyName,
    profileImageUrl: profile.photos[0]?.value,
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Configure Google OAuth Strategy
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    callbackURL: `${process.env.BASE_URL}/api/callback`
  },
  async (accessToken: string, refreshToken: string, profile: any, done: any) => {
    try {
      await upsertUser(profile);
      
      // Store user info in session
      const user = {
        id: profile.id,
        email: profile.emails[0]?.value,
        firstName: profile.name?.givenName,
        lastName: profile.name?.familyName,
        profileImageUrl: profile.photos[0]?.value,
        accessToken,
        refreshToken
      };
      
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  }));

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  // Authentication routes
  app.get("/api/login", passport.authenticate("google", {
    scope: ["profile", "email"]
  }));

  app.get("/api/callback", 
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    (req, res) => {
      // Successful authentication, redirect home
      res.redirect("/");
    }
  );

  app.get("/api/logout", async (req: any, res) => {
    // Save any active timer session before logout
    if (req.user && req.user.id) {
      try {
        const { ActiveTimerSessionModel } = await import('../models/ActiveTimerSession');
        const { WorkSessionModel } = await import('../models/WorkSession');
        
        const userId = req.user.id;
        const activeSession = await ActiveTimerSessionModel.getActiveSession(userId);
        
        if (activeSession) {
          // Calculate final elapsed time
          const finalElapsedTime = await ActiveTimerSessionModel.getElapsedTime(activeSession);
          
          // Save if there's meaningful time elapsed (more than 0 seconds)
          if (finalElapsedTime > 0) {
            await WorkSessionModel.createWorkSession({
              userId,
              sessionType: activeSession.sessionType,
              actualDuration: finalElapsedTime,
              startTime: activeSession.startTime,
              completed: true,
            });
          }

          // Remove the active session
          await ActiveTimerSessionModel.removeActiveSession(userId);
        }
      } catch (error) {
        console.error("Error saving active session on logout:", error);
        // Continue with logout even if session saving fails
      }
    }
    
    req.logout((err: any) => {
      if (err) {
        console.error("Logout error:", err);
      }
      req.session.destroy((sessionErr: any) => {
        if (sessionErr) {
          console.error("Session destroy error:", sessionErr);
        }
        res.clearCookie('connect.sid');
        res.redirect("/");
      });
    });
  });
}