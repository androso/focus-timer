import {
  workSessions,
  type WorkSession,
  type InsertWorkSession,
} from "@shared/schema";
import { db } from "../config/database";
import { eq, desc, gte, lte, and } from "drizzle-orm";
import { fromZonedTime, toZonedTime } from "date-fns-tz";
import { startOfDay, endOfDay, startOfWeek, addDays } from "date-fns";

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

  static async getWorkSessionsByUserAndDate(userId: string, date: Date, timezone: string = "UTC"): Promise<WorkSession[]> {
    // Get start and end of the specified date in user's timezone
    const userDate = toZonedTime(date, timezone);
    const startOfUserDay = startOfDay(userDate);
    const endOfUserDay = endOfDay(userDate);
    
    // Convert back to UTC for database query
    const startOfDayUTC = fromZonedTime(startOfUserDay, timezone);
    const endOfDayUTC = fromZonedTime(endOfUserDay, timezone);

    return await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, startOfDayUTC),
          lte(workSessions.startTime, endOfDayUTC)
        )
      )
      .orderBy(desc(workSessions.startTime));
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

  static async getTodayStats(userId: string, timezone: string = "UTC"): Promise<{
    completedSessions: number;
    totalTime: number;
    efficiency: number;
  }> {
    // Get current date in user's timezone
    const now = new Date();
    const userNow = toZonedTime(now, timezone);
    
    // Get start and end of today in user's timezone
    const startOfUserDay = startOfDay(userNow);
    const endOfUserDay = endOfDay(userNow);
    
    // Convert to UTC for database query
    const startOfDayUTC = fromZonedTime(startOfUserDay, timezone);
    const endOfDayUTC = fromZonedTime(endOfUserDay, timezone);

    const sessions = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, startOfDayUTC),
          lte(workSessions.startTime, endOfDayUTC),
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

  static async getWeeklyStats(userId: string, timezone: string = "UTC"): Promise<{
    day: string;
    totalTime: number;
  }[]> {
    // Get current date in user's timezone
    const now = new Date();
    const userNow = toZonedTime(now, timezone);
    
    // Get start of week (Sunday) in user's timezone
    const startOfUserWeek = startOfWeek(userNow, { weekStartsOn: 0 });
    const endOfUserWeek = addDays(startOfUserWeek, 7);
    
    // Convert to UTC for database query
    const startOfWeekUTC = fromZonedTime(startOfUserWeek, timezone);
    const endOfWeekUTC = fromZonedTime(endOfUserWeek, timezone);

    const sessions = await db
      .select()
      .from(workSessions)
      .where(
        and(
          eq(workSessions.userId, userId),
          gte(workSessions.startTime, startOfWeekUTC),
          lte(workSessions.startTime, endOfWeekUTC),
          eq(workSessions.sessionType, 'work')
        )
      );

    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const weeklyStats = days.map(day => ({ day, totalTime: 0 }));

    sessions.forEach(session => {
      // Convert session time back to user's timezone for day calculation
      const sessionTimeInUserTz = toZonedTime(session.startTime, timezone);
      const dayIndex = sessionTimeInUserTz.getDay();
      weeklyStats[dayIndex].totalTime += session.actualDuration;
    });

    return weeklyStats;
  }
}