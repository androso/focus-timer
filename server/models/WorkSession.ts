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

  static async getWorkSessionsByUserAndDate(userId: string, date: Date): Promise<WorkSession[]> {
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

  static async getTodayStats(userId: string): Promise<{
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

  static async getWeeklyStats(userId: string): Promise<{
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
}