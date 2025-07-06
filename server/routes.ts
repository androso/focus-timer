import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./replitAuth";
import { isAuthenticated } from "./middleware/auth";
import { WorkSessionController } from "./controllers/WorkSessionController";
import { TimerSettingsController } from "./controllers/TimerSettingsController";
import { UserController } from "./controllers/UserController";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, UserController.getCurrentUser);

  // Work session routes
  app.post('/api/work-sessions', isAuthenticated, WorkSessionController.createWorkSession);
  app.get('/api/work-sessions', isAuthenticated, WorkSessionController.getWorkSessions);
  app.get('/api/work-sessions/by-date', isAuthenticated, WorkSessionController.getWorkSessionsByDate);
  app.get('/api/work-sessions/by-date-range', isAuthenticated, WorkSessionController.getWorkSessionsByDateRange);

  // Stats routes
  app.get('/api/stats/today', isAuthenticated, WorkSessionController.getTodayStats);
  app.get('/api/stats/weekly', isAuthenticated, WorkSessionController.getWeeklyStats);

  // Timer settings routes
  app.get('/api/timer-settings', isAuthenticated, TimerSettingsController.getTimerSettings);
  app.post('/api/timer-settings', isAuthenticated, TimerSettingsController.upsertTimerSettings);

  const httpServer = createServer(app);
  return httpServer;
}
