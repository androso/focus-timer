import {
  timerSettings,
  type TimerSettings,
  type InsertTimerSettings,
} from "@shared/schema";
import { db } from "../config/database";
import { eq } from "drizzle-orm";

export class TimerSettingsModel {
  static async getTimerSettings(userId: string): Promise<TimerSettings | undefined> {
    const [settings] = await db
      .select()
      .from(timerSettings)
      .where(eq(timerSettings.userId, userId));
    return settings;
  }

  static async upsertTimerSettings(settings: InsertTimerSettings): Promise<TimerSettings> {
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
}