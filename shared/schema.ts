import {
  sqliteTable,
  text,
  integer,
  index
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess", { mode: "json" }).notNull(),
    expire: integer("expire", { mode: "timestamp" }).notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = sqliteTable("users", {
  id: text("id").primaryKey().notNull(),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  timezone: text("timezone").default("UTC"), // User's preferred timezone
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Work sessions table
export const workSessions = sqliteTable("work_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id),
  sessionType: text("session_type").notNull(), // 'work' or 'break'
  actualDuration: integer("actual_duration").notNull(), // in seconds
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  completed: integer("completed", {mode: "boolean"}).default(true),
});

// Timer settings table
export const timerSettings = sqliteTable("timer_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  workDuration: integer("work_duration").default(25), // in minutes
  shortBreakDuration: integer("short_break_duration").default(5), // in minutes
  longBreakDuration: integer("long_break_duration").default(15), // in minutes
  soundNotifications: integer("sound_notifications", { mode: "boolean" }).default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).default(new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(new Date()),
});

// Active timer sessions table
export const activeTimerSessions = sqliteTable("active_timer_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id").notNull().references(() => users.id).unique(),
  sessionType: text("session_type").notNull(), // 'work' or 'break'
  startTime: integer("start_time", { mode: "timestamp" }).notNull(),
  timeElapsed: integer("time_elapsed").notNull().default(0), // in seconds
  isRunning: integer("is_running", { mode: "boolean" }).notNull().default(true),
  isPaused: integer("is_paused", { mode: "boolean" }).notNull().default(false),
  sessionCount: integer("session_count").default(1),
});

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertWorkSessionSchema = createInsertSchema(workSessions).omit({
  id: true,
}).extend({
  startTime: z.string().or(z.date()).transform((val) => new Date(val)),
});

export const insertTimerSettingsSchema = createInsertSchema(timerSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertActiveTimerSessionSchema = createInsertSchema(activeTimerSessions).omit({
  id: true,
}).extend({
  startTime: z.string().or(z.date()).transform((val) => new Date(val)),
});

export type InsertWorkSession = z.infer<typeof insertWorkSessionSchema>;
export type WorkSession = typeof workSessions.$inferSelect;

export type InsertTimerSettings = z.infer<typeof insertTimerSettingsSchema>;
export type TimerSettings = typeof timerSettings.$inferSelect;

export type InsertActiveTimerSession = z.infer<typeof insertActiveTimerSessionSchema>;
export type ActiveTimerSession = typeof activeTimerSessions.$inferSelect;
