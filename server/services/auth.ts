import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import passport from "passport";
import type { Express } from "express";
import { UserController } from "../controllers/UserController";
import { config } from "server/config";
import { generateJWT } from "./jwt";
import { RefreshTokenModel } from "server/models/RefreshTokens";
import { extractRefreshToken } from "../utils/tokenExtractors";

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(passport.initialize());

  // Configure Google OAuth Strategy
  passport.use(
    new GoogleStrategy(
      {
        clientID: config.api.googleClientId,
        clientSecret: config.api.googleClientSecret,
        callbackURL: `${config.api.baseUrl}/api/callback`,
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: any,
      ) => {
        try {
          await UserController.upsertUser({
            id: profile.id,
            email: profile.emails[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos[0]?.value,
          });

          const user = {
            id: profile.id,
            email: profile.emails[0]?.value,
            firstName: profile.name?.givenName,
            lastName: profile.name?.familyName,
            profileImageUrl: profile.photos[0]?.value,
            accessToken,
            refreshToken,
          };

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      },
    ),
  );

  // Authentication routes
  app.get(
    "/api/login",
    passport.authenticate("google", {
      scope: ["profile", "email"],
    }),
  );

  app.get(
    "/api/callback",
    passport.authenticate("google", { failureRedirect: "/api/login" }),
    async (req, res) => {
      // Successful authentication, generate JWT tokens
      const user = req.user as any;
      if (user && user.id) {
        // generate access token
        const accessToken = generateJWT(user.id, config.jwt.defaultDuration);
        // generate refreshtoken and store it in database
        const refreshToken = await RefreshTokenModel.storeRefreshToken(user.id);
        // set access token and refresh token in cookies so that client can use them
        res.cookie("accessToken", accessToken, {
          httpOnly: true,
          secure: config.api.nodeEnv === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 1000, // 1 hour
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          secure: config.api.nodeEnv === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });
      }

      res.redirect("/");
    },
  );

  app.post("/api/refresh-token", async (req, res) => {
    if (req.cookies && req.cookies.refreshToken && req.user) {
      const refreshToken = req.cookies.refreshToken;
      const user = req.user as any;
      const tokenRecord = RefreshTokenModel.validateRefreshToken(
        refreshToken,
        user.id,
      );

      if (!tokenRecord) {
        res.status(401).json({ message: "Invalid or expired refresh token" });
      } else {
        const newAccessToken = generateJWT(user.id, config.jwt.defaultDuration);

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: config.api.nodeEnv === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 1000,
        });

        res.json({ message: "Token refreshed successfully" });
      }
    } else {
      res.status(401).json({ message: "No refresh token found" });
    }
  });

  app.get("/api/logout", async (req: any, res) => {
    const { validateJWT } = await import("./jwt");
    const { extractAccessToken } = await import("../utils/tokenExtractors");

    const accessToken = extractAccessToken(req);
    let userId: string | undefined;

    if (accessToken) {
      try {
        const payload = validateJWT(accessToken);
        userId = payload?.sub;
      } catch (e) {
        console.log("Token validation failed during logout: ", e);
      }
    }

    // it's time to save any active timer session before logout
    if (userId) {
      try {
        const { ActiveTimerSessionModel } = await import(
          "../models/ActiveTimerSession"
        );
        const { WorkSessionModel } = await import("../models/WorkSession");

        const activeSession =
          await ActiveTimerSessionModel.getActiveSession(userId);

        if (activeSession) {
          const finalElapsedTime =
            await ActiveTimerSessionModel.getElapsedTime(activeSession);
          if (finalElapsedTime > 0) {
            await WorkSessionModel.createWorkSession({
              userId,
              sessionType: activeSession.sessionType,
              actualDuration: finalElapsedTime,
              startTime: activeSession.startTime,
              completed: true,
            });
          }

          await ActiveTimerSessionModel.removeActiveSession(userId);
        }
      } catch (e) {
        console.error("Error saving active session on logout: ", e);
      }
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.redirect("/");
  });

  app.post("/api/revoke-token", async (req, res) => {
    const refreshToken = extractRefreshToken(req);

    if (!refreshToken) {
      res.status(401).json({ message: "No refresh token provided" });
    }

    try {
      await RefreshTokenModel.revokeRefreshToken(refreshToken);
      res.clearCookie("refreshToken");
      res.json({ message: "Token revoked successfully" });
    } catch (e) {
      console.error("Token revoke error: ", e);
      res.status(500).json({ message: "Failed to revoke token" });
    }
  });
}
