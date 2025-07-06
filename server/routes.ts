import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertWorkSessionSchema, insertTimerSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Work session routes
  app.post('/api/work-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertWorkSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const workSession = await storage.createWorkSession(sessionData);
      res.json(workSession);
    } catch (error) {
      console.error("Error creating work session:", error);
      res.status(400).json({ message: "Failed to create work session" });
    }
  });

  app.get('/api/work-sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getWorkSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions:", error);
      res.status(500).json({ message: "Failed to fetch work sessions" });
    }
  });

  app.get('/api/work-sessions/date/:date', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const date = new Date(req.params.date);
      const sessions = await storage.getWorkSessionsByUserAndDate(userId, date);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions by date:", error);
      res.status(500).json({ message: "Failed to fetch work sessions" });
    }
  });

  app.get('/api/work-sessions/range', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate) {
        return res.status(400).json({ message: "Start date and end date are required" });
      }

      const sessions = await storage.getWorkSessionsByUserAndDateRange(
        userId,
        new Date(startDate as string),
        new Date(endDate as string)
      );
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions by range:", error);
      res.status(500).json({ message: "Failed to fetch work sessions" });
    }
  });

  // Stats routes
  app.get('/api/stats/today', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getTodayStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today's stats:", error);
      res.status(500).json({ message: "Failed to fetch today's stats" });
    }
  });

  app.get('/api/stats/weekly', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getWeeklyStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  });

  // Timer settings routes
  app.get('/api/timer-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settings = await storage.getTimerSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching timer settings:", error);
      res.status(500).json({ message: "Failed to fetch timer settings" });
    }
  });

  app.post('/api/timer-settings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const settingsData = insertTimerSettingsSchema.parse({
        ...req.body,
        userId,
      });
      
      const settings = await storage.upsertTimerSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating timer settings:", error);
      res.status(400).json({ message: "Failed to update timer settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
