import { Request, Response } from 'express';
import { WorkSessionModel } from '../models/WorkSession';
import { insertWorkSessionSchema } from '@shared/schema';

export class WorkSessionController {
  static async createWorkSession(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertWorkSessionSchema.parse({
        ...req.body,
        userId,
      });
      
      const session = await WorkSessionModel.createWorkSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating work session:", error);
      res.status(400).json({ message: "Failed to create work session" });
    }
  }

  static async getWorkSessions(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const sessions = await WorkSessionModel.getWorkSessionsByUser(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions:", error);
      res.status(500).json({ message: "Failed to fetch work sessions" });
    }
  }

  static async getWorkSessionsByDate(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const { date } = req.query;
      
      if (!date || typeof date !== 'string') {
        return res.status(400).json({ message: "Date parameter is required" });
      }
      
      const targetDate = new Date(date);
      const sessions = await WorkSessionModel.getWorkSessionsByUserAndDate(userId, targetDate);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions by date:", error);
      res.status(500).json({ message: "Failed to fetch work sessions" });
    }
  }

  static async getWorkSessionsByDateRange(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const { startDate, endDate } = req.query;
      
      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        return res.status(400).json({ message: "Start date and end date parameters are required" });
      }
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const sessions = await WorkSessionModel.getWorkSessionsByUserAndDateRange(userId, start, end);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching work sessions by date range:", error);
      res.status(500).json({ message: "Failed to fetch work sessions" });
    }
  }

  static async getTodayStats(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const stats = await WorkSessionModel.getTodayStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching today's stats:", error);
      res.status(500).json({ message: "Failed to fetch today's stats" });
    }
  }

  static async getWeeklyStats(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const stats = await WorkSessionModel.getWeeklyStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching weekly stats:", error);
      res.status(500).json({ message: "Failed to fetch weekly stats" });
    }
  }
}