import { Request, Response } from 'express';
import { TimerSettingsModel } from '../models/TimerSettings';
import { insertTimerSettingsSchema } from '@shared/schema';

export class TimerSettingsController {
  static async getTimerSettings(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const settings = await TimerSettingsModel.getTimerSettings(userId);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching timer settings:", error);
      res.status(500).json({ message: "Failed to fetch timer settings" });
    }
  }

  static async upsertTimerSettings(req: any, res: Response) {
    try {
      const userId = req.user.id;
      const settingsData = insertTimerSettingsSchema.parse({
        ...req.body,
        userId,
      });
      
      const settings = await TimerSettingsModel.upsertTimerSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error("Error updating timer settings:", error);
      res.status(400).json({ message: "Failed to update timer settings" });
    }
  }
}