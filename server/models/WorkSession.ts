import {
  workSessions,
  type WorkSession,
  type InsertWorkSession,
} from "@shared/schema";
import { db } from "../config/database";
import { eq, desc, gte, lte, and } from "drizzle-orm";

export class WorkSessionModel {
  static async createWorkSession(session: InsertWorkSession): Promise<WorkSession> {
    const [workSession] = await db
      .insert(workSessions)
      .values(session)
      .returning();
    return workSession;
  }

  static async getWorkSessionsByUser(userId: string): Promise<WorkSession[]> {
    return await db
      .select()
      .from(workSessions)
      .where(eq(workSessions.userId, userId))
      .orderBy(desc(workSessions.startTime))
      .limit(10);
  }

  static async getWorkSessionsByUserAndDate(userId: string, date: Date, timezone?: string): Promise<WorkSession[]> {
    // If timezone is provided, use it; otherwise use the date as-is (assuming it's already in user's timezone)
    let startOfDay: Date;
    let endOfDay: Date;
    
    if (timezone) {
      // Create timezone-aware dates
      const dateStr = date.toISOString().split('T')[0]; // Get YYYY-MM-DD
      startOfDay = new Date(`${dateStr}T00:00:00.000`);
      endOfDay = new Date(`${dateStr}T23:59:59.999`);
      
      // Adjust for timezone offset
      const offsetMinutes = this.getTimezoneOffset(timezone);
      startOfDay = new Date(startOfDay.getTime() - (offsetMinutes * 60000));
      endOfDay = new Date(endOfDay.getTime() - (offsetMinutes * 60000));
    } else {
      startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      
      endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
    }

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

  private static getTimezoneOffset(timezone: string): number {
    // Common timezone offsets (in minutes from UTC)
    const timezoneOffsets: { [key: string]: number } = {
      'America/El_Salvador': 360, // UTC-6
      'America/New_York': 300, // UTC-5 (EST) / UTC-4 (EDT)
      'America/Chicago': 360, // UTC-6 (CST) / UTC-5 (CDT)
      'America/Denver': 420, // UTC-7 (MST) / UTC-6 (MDT)
      'America/Los_Angeles': 480, // UTC-8 (PST) / UTC-7 (PDT)
      'Europe/London': 0, // UTC+0 (GMT) / UTC+1 (BST)
      'Europe/Paris': -60, // UTC+1 (CET) / UTC+2 (CEST)
      'Asia/Tokyo': -540, // UTC+9
      'Australia/Sydney': -600, // UTC+10 / UTC+11 (DST)
    };
    
    return timezoneOffsets[timezone] || 0;
  }

  static async getWorkSessionsByUserAndDateRange(userId: string, startDate: Date, endDate: Date): Promise<WorkSession[]> {
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

  static async getTodayStats(userId: string, timezone?: string): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }> {
    let today: Date;
    let tomorrow: Date;
    
    if (timezone) {
      // Get current date in user's timezone
      const now = new Date();
      const offsetMinutes = this.getTimezoneOffset(timezone);
      const userNow = new Date(now.getTime() - (offsetMinutes * 60000));
      
      today = new Date(userNow);
      today.setHours(0, 0, 0, 0);
      
      tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Convert back to UTC for database query
      today = new Date(today.getTime() + (offsetMinutes * 60000));
      tomorrow = new Date(tomorrow.getTime() + (offsetMinutes * 60000));
    } else {
      today = new Date();
      today.setHours(0, 0, 0, 0);
      
      tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
    }

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

  static async getWeeklyStats(userId: string, timezone?: string): Promise<{
    day: string;
    totalTime: number;
  }[]> {
    let today: Date;
    let startOfWeek: Date;
    let endOfWeek: Date;
    
    if (timezone) {
      // Get current date in user's timezone
      const now = new Date();
      const offsetMinutes = this.getTimezoneOffset(timezone);
      today = new Date(now.getTime() - (offsetMinutes * 60000));
      
      startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      // Convert back to UTC for database query
      startOfWeek = new Date(startOfWeek.getTime() + (offsetMinutes * 60000));
      endOfWeek = new Date(endOfWeek.getTime() + (offsetMinutes * 60000));
    } else {
      today = new Date();
      startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay());
      startOfWeek.setHours(0, 0, 0, 0);

      endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
    }

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
      // Adjust session time to user's timezone for day calculation
      let sessionTime = session.startTime;
      if (timezone) {
        const offsetMinutes = this.getTimezoneOffset(timezone);
        sessionTime = new Date(session.startTime.getTime() - (offsetMinutes * 60000));
      }
      
      const dayIndex = sessionTime.getDay();
      weeklyStats[dayIndex].totalTime += session.actualDuration;
    });

    return weeklyStats;
  }
}