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
      .set(updates)
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
    // Since the frontend continuously updates timeElapsed every second,
    // we can simply return the stored value to avoid double-counting
    return session.timeElapsed;
  }
}