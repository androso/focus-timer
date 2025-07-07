import { db } from '../config/database';
import { activeTimerSessions, type ActiveTimerSession, type InsertActiveTimerSession } from '@shared/schema';
import { eq } from 'drizzle-orm';

export class ActiveTimerSessionModel {
  static async getActiveSession(userId: string): Promise<ActiveTimerSession | undefined> {
    const results = await db
      .select()
      .from(activeTimerSessions)
      .where(eq(activeTimerSessions.userId, userId))
      .limit(1);
    
    return results[0];
  }

  static async createActiveSession(session: InsertActiveTimerSession): Promise<ActiveTimerSession> {
    // First, remove any existing active session for this user
    await this.removeActiveSession(session.userId);
    
    const results = await db
      .insert(activeTimerSessions)
      .values(session)
      .returning();
    
    return results[0];
  }

  static async updateActiveSession(userId: string, updates: Partial<InsertActiveTimerSession>): Promise<ActiveTimerSession | undefined> {
    const results = await db
      .update(activeTimerSessions)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(activeTimerSessions.userId, userId))
      .returning();
    
    return results[0];
  }

  static async removeActiveSession(userId: string): Promise<void> {
    await db
      .delete(activeTimerSessions)
      .where(eq(activeTimerSessions.userId, userId));
  }

  static async getElapsedTime(session: ActiveTimerSession): Promise<number> {
    if (!session.isRunning) {
      return session.timeElapsed;
    }

    const now = new Date();
    const timeSinceStart = Math.floor((now.getTime() - session.startTime.getTime()) / 1000);
    
    // If the session was paused, we only count the elapsed time up to when it was paused
    if (session.isPaused) {
      return session.timeElapsed;
    }
    
    return session.timeElapsed + timeSinceStart;
  }
}