import { Request, Response } from 'express';
import { UserModel } from '../models/User';
import { type UpsertUser } from '@shared/schema';

export class UserController {
  static async getCurrentUser(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const user = await UserModel.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }

  static async getUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await UserModel.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  }

  static async upsertUser(userData: UpsertUser) {
    try {
      const user = await UserModel.upsertUser(userData);
      return user;
    } catch (error) {
      console.error("Error upserting user:", error);
      throw error;
    }
  }

  static async updateUserTimezone(req: any, res: Response) {
    try {
      const userId = req.user.claims.sub;
      const { timezone } = req.body;
      
      // Validate timezone
      if (!timezone || typeof timezone !== 'string') {
        return res.status(400).json({ message: "Valid timezone is required" });
      }

      // Update user with new timezone
      const user = await UserModel.upsertUser({ 
        id: userId, 
        timezone: timezone 
      });
      
      res.json({ message: "Timezone updated successfully", user });
    } catch (error) {
      console.error("Error updating user timezone:", error);
      res.status(500).json({ message: "Failed to update timezone" });
    }
  }
}