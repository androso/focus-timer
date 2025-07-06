import { UserModel } from "./models/User";
import { WorkSessionModel } from "./models/WorkSession";
import { TimerSettingsModel } from "./models/TimerSettings";
import {
  type User,
  type UpsertUser,
  type WorkSession,
  type InsertWorkSession,
  type TimerSettings,
  type InsertTimerSettings,
} from "@shared/schema";

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Work session operations
  createWorkSession(session: InsertWorkSession): Promise<WorkSession>;
  getWorkSessionsByUser(userId: string): Promise<WorkSession[]>;
  getWorkSessionsByUserAndDate(userId: string, date: Date): Promise<WorkSession[]>;
  getWorkSessionsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]>;
  getTodayStats(userId: string): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }>;
  getWeeklyStats(userId: string): Promise<{
    day: string;
    totalTime: number;
  }[]>;
  
  // Timer settings operations
  getTimerSettings(userId: string): Promise<TimerSettings | undefined>;
  upsertTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings>;
}

export class DatabaseStorage implements IStorage {
  // User operations - delegating to UserModel
  async getUser(id: string): Promise<User | undefined> {
    return await UserModel.getUser(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    return await UserModel.upsertUser(userData);
  }

  // Work session operations - delegating to WorkSessionModel
  async createWorkSession(session: InsertWorkSession): Promise<WorkSession> {
    return await WorkSessionModel.createWorkSession(session);
  }

  async getWorkSessionsByUser(userId: string): Promise<WorkSession[]> {
    return await WorkSessionModel.getWorkSessionsByUser(userId);
  }

  async getWorkSessionsByUserAndDate(userId: string, date: Date): Promise<WorkSession[]> {
    return await WorkSessionModel.getWorkSessionsByUserAndDate(userId, date);
  }

  async getWorkSessionsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]> {
    return await WorkSessionModel.getWorkSessionsByUserAndDateRange(userId, startDate, endDate);
  }

  async getTodayStats(userId: string): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }> {
    return await WorkSessionModel.getTodayStats(userId);
  }

  async getWeeklyStats(userId: string): Promise<{
    day: string;
    totalTime: number;
  }[]> {
    return await WorkSessionModel.getWeeklyStats(userId);
  }

  // Timer settings operations - delegating to TimerSettingsModel
  async getTimerSettings(userId: string): Promise<TimerSettings | undefined> {
    return await TimerSettingsModel.getTimerSettings(userId);
  }

  async upsertTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings> {
    return await TimerSettingsModel.upsertTimerSettings(settings);
  }
}

export const storage = new DatabaseStorage();