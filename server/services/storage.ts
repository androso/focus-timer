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
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Work session operations
  async createWorkSession(session: InsertWorkSession): Promise<WorkSession> {
    const [workSession] = await db
      .insert(workSessions)
      .values(session)
      .returning();
    return workSession;
  }

  async getWorkSessionsByUser(userId: string): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.userId, userId))
      .orderBy(desc(workSessions.startTime))
      .limit(10);
  }

  async getWorkSessionsByUserAndDate(userId: string, date: Date): Promise<WorkSession[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, startOfDay),
          lte(workSessions.startTime, endOfDay)
        )
      )
      .orderBy(desc(workSessions.startTime));
  }

  async getWorkSessionsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, startDate),
          lte(workSessions.startTime, endDate)
        )
      )
      .orderBy(desc(workSessions.startTime));
  }

  async getTodayStats(userId: string): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const sessions = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, today),
          lte(workSessions.startTime, tomorrow),
          eq(workSessions.sessionType, 'work')
        )
      );

    const completedSessions = sessions.filter(s => s.completed).length;
    const totalTime = sessions.reduce((sum, s) => sum + s.actualDuration, 0);
    const plannedTime = sessions.reduce((sum, s) => sum + s.plannedDuration, 0);
    const efficiency = plannedTime > 0 ? Math.round((totalTime / plannedTime) * 100) : 0;

    return {
      completedSessions,
      totalTime,
      efficiency,
    };
  }

  async getWeeklyStats(userId: string): Promise<{
    day: string;
    totalTime: number;
  }[]> {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const sessions = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, startOfWeek),
          lte(workSessions.startTime, endOfWeek),
          eq(workSessions.sessionType, 'work')
        )
      );

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyStats = days.map(day => ({ day, totalTime: 0 }));

    sessions.forEach(session => {
      const dayIndex = session.startTime.getDay();
      weeklyStats[dayIndex].totalTime += session.actualDuration;
    });

    return weeklyStats;
  }

  // Timer settings operations
  async getTimerSettings(userId: string): Promise<TimerSettings | undefined> {
    const [settings] = await db
      .select()
      .from(timerSettings)
      .where(eq(timerSettings.userId, userId));
    return settings;
  }

  async upsertTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings> {
    const [timerSetting] = await db
      .insert(timerSettings)
      .values(settings)
      .onConflictDoUpdate({
        target: timerSettings.userId,
        set: {
          ...settings,
          updatedAt: new Date(),
        },
      })
      .returning();
    return timerSetting;
  }

  // Active timer session operations
  async getActiveTimerSession(userId: string): Promise<ActiveTimerSession | undefined> {
    const [session] = await db
      .select()
      .from(activeTimerSessions)
      .where(eq(activeTimerSessions.userId, userId));
    return session;
  }

  async createActiveTimerSession(session: InsertActiveTimerSession): Promise<ActiveTimerSession> {
    // First, remove any existing active session for this user
    await this.removeActiveTimerSession(session.userId);
    
    const [activeSession] = await db
      .insert(activeTimerSessions)
      .values(session)
      .returning();
    return activeSession;
  }

  async updateActiveTimerSession(userId: string, updates: Partial<InsertActiveTimerSession>): Promise<ActiveTimerSession | undefined> {
    const [updatedSession] = await db
      .update(activeTimerSessions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(activeTimerSessions.userId, userId))
      .returning();
    return updatedSession;
  }

  async removeActiveTimerSession(userId: string): Promise<void> {
    await db
      .delete(activeTimerSessions)
      .where(eq(activeTimerSessions.userId, userId));
  }
}

export const storage = new DatabaseStorage();
