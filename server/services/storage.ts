import {
  users,
  workSessions,
  timerSettings,
  activeTimerSessions,
  type User,
  type UpsertUser,
  type WorkSession,
  type InsertWorkSession,
  type TimerSettings,
  type InsertTimerSettings,
  type ActiveTimerSession,
  type InsertActiveTimerSession,
} from "@shared/schema";
import { db } from "../config/database";
import { eq, desc, gte, lte, and, sql } from "drizzle-orm";
import { UserModel } from "../models/User";
import { WorkSessionModel } from "../models/WorkSession";
import { TimerSettingsModel } from "../models/TimerSettings";
import { ActiveTimerSessionModel } from "../models/ActiveTimerSession";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Work session operations
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  getWorkSessionsByUser(userId: string): Promise<WorkSession[]>;
  getWorkSessionsByUserAndDate(userId: string, date: Date, timezone?: string): Promise<WorkSession[]>;
  getWorkSessionsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]>;
  getTodayStats(userId: string, timezone?: string): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }>;
  getWeeklyStats(userId: string, timezone?: string): Promise<{
    day: string;
    totalTime: number;
  }[]>;
  
  // Timer settings operations
  getTimerSettings(userId: string): Promise<TimerSettings | undefined>;
  upsertTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings>;
  
  // Active timer session operations
  getActiveTimerSession(userId: string): Promise<ActiveTimerSession | undefined>;
  createActiveTimerSession(session: InsertActiveTimerSession): Promise<ActiveTimerSession>;
  updateActiveTimerSession(userId: string, updates: Partial<InsertActiveTimerSession>): Promise<ActiveTimerSession | undefined>;
  removeActiveTimerSession(userId: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  async getUser(id: string): Promise<User | undefined> {
    return await UserModel.getUser(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return await UserModel.upsertUser(userData);
  }

  // Work session operations
  async createWorkSession(session: InsertWorkSession): Promise<WorkSession> {
    return await WorkSessionModel.createWorkSession(session);
  }

  async getWorkSessionsByUser(userId: string): Promise<WorkSession[]> {
    return await WorkSessionModel.getWorkSessionsByUser(userId);
  }

  async getWorkSessionsByUserAndDate(userId: string, date: Date, timezone?: string): Promise<WorkSession[]> {
    // Get user's timezone if not provided
    if (!timezone) {
      const user = await this.getUser(userId);
      timezone = user?.timezone || "UTC";
    }
    return await WorkSessionModel.getWorkSessionsByUserAndDate(userId, date, timezone);
  }

  async getWorkSessionsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]> {
    return await WorkSessionModel.getWorkSessionsByUserAndDateRange(userId, startDate, endDate);
  }

  async getTodayStats(userId: string, timezone?: string): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }> {
    // Get user's timezone if not provided
    if (!timezone) {
      const user = await this.getUser(userId);
      timezone = user?.timezone || "UTC";
    }
    return await WorkSessionModel.getTodayStats(userId, timezone);
  }

  async getWeeklyStats(userId: string, timezone?: string): Promise<{
    day: string;
    totalTime: number;
  }[]> {
    // Get user's timezone if not provided
    if (!timezone) {
      const user = await this.getUser(userId);
      timezone = user?.timezone || "UTC";
    }
    return await WorkSessionModel.getWeeklyStats(userId, timezone);
  }

  // Timer settings operations
  async getTimerSettings(userId: string): Promise<TimerSettings | undefined> {
    return await TimerSettingsModel.getTimerSettings(userId);
  }

  async upsertTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings> {
    return await TimerSettingsModel.upsertTimerSettings(settings);
  }

  // Active timer session operations
  async getActiveTimerSession(userId: string): Promise<ActiveTimerSession | undefined> {
    return await ActiveTimerSessionModel.getActiveSession(userId);
  }

  async createActiveTimerSession(session: InsertActiveTimerSession): Promise<ActiveTimerSession> {
    return await ActiveTimerSessionModel.createActiveSession(session);
  }

  async updateActiveTimerSession(userId: string, updates: Partial<InsertActiveTimerSession>): Promise<ActiveTimerSession | undefined> {
    return await ActiveTimerSessionModel.updateActiveSession(userId, updates);
  }

  async removeActiveTimerSession(userId: string): Promise<void> {
    return await ActiveTimerSessionModel.removeActiveSession(userId);
  }
}

export const storage = new DatabaseStorage();
