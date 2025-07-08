import { Request, Response } from 'express';
import { ActiveTimerSessionModel } from '../models/ActiveTimerSession';
import { WorkSessionModel } from '../models/WorkSession';
import { insertActiveTimerSessionSchema } from '@shared/schema';

export class ActiveTimerSessionController {
  static async getActiveSession(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const activeSession = await ActiveTimerSessionModel.getActiveSession(userId);
      
      if (!activeSession) {
        return res.json(null);
      }

      // Calculate current elapsed time
      const currentElapsedTime = await ActiveTimerSessionModel.getElapsedTime(activeSession);
      
      res.json({
        ...activeSession,
        currentElapsedTime,
      });
    } catch (error) {
      console.error("Error fetching active session:", error);
      res.status(500).json({ message: "Failed to fetch active session" });
    }
  }

  static async createActiveSession(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertActiveTimerSessionSchema.parse({
        ...req.body,
        userId,
        startTime: new Date(),
      });
      
      const activeSession = await ActiveTimerSessionModel.createActiveSession(sessionData);
      res.json(activeSession);
    } catch (error) {
      console.error("Error creating active session:", error);
      res.status(400).json({ message: "Failed to create active session" });
    }
  }

  static async updateActiveSession(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const updates = req.body;
      
      const updatedSession = await ActiveTimerSessionModel.updateActiveSession(userId, updates);
      
      if (!updatedSession) {
        return res.status(404).json({ message: "No active session found" });
      }

      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating active session:", error);
      res.status(400).json({ message: "Failed to update active session" });
    }
  }

  static async stopAndSaveSession(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const { finalElapsedTime } = req.body;
      const activeSession = await ActiveTimerSessionModel.getActiveSession(userId);
      
      if (!activeSession) {
        return res.status(404).json({ message: "No active session found" });
      }

      // Use the finalElapsedTime from the frontend, or fall back to stored value
      const elapsedTime = finalElapsedTime || await ActiveTimerSessionModel.getElapsedTime(activeSession);
      
      // Only save if there's meaningful time elapsed (more than 0 seconds)
      if (elapsedTime > 0) {
        // Create a completed work session
        await WorkSessionModel.createWorkSession({
          userId,
          sessionType: activeSession.sessionType,
          actualDuration: elapsedTime,
          startTime: activeSession.startTime,
          completed: true,
        });
      }

      // Remove the active session
      await ActiveTimerSessionModel.removeActiveSession(userId);
      
      res.json({ 
        message: "Session stopped and saved",
        elapsedTime: elapsedTime 
      });
    } catch (error) {
      console.error("Error stopping and saving session:", error);
      res.status(500).json({ message: "Failed to stop and save session" });
    }
  }

  static async removeActiveSession(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      await ActiveTimerSessionModel.removeActiveSession(userId);
      res.json({ message: "Active session removed" });
    } catch (error) {
      console.error("Error removing active session:", error);
      res.status(500).json({ message: "Failed to remove active session" });
    }
  }
}