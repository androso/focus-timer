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
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  sessionType: varchar("session_type").notNull(), // 'work' or 'break'
  actualDuration: integer("actual_duration").notNull(), // in seconds
  startTime: timestamp("start_time").notNull(),
  completed: boolean("completed").default(true),
});

// Timer settings table
export const timerSettings = pgTable("timer_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  workDuration: integer("work_duration").default(25), // in minutes
  shortBreakDuration: integer("short_break_duration").default(5), // in minutes
  longBreakDuration: integer("long_break_duration").default(15), // in minutes
  soundNotifications: boolean("sound_notifications").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Active timer sessions table
export const activeTimerSessions = pgTable("active_timer_sessions", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id).unique(),
  sessionType: varchar("session_type").notNull(), // 'work' or 'break'
  startTime: timestamp("start_time").notNull(),
  timeElapsed: integer("time_elapsed").notNull().default(0), // in seconds
  isRunning: boolean("is_running").notNull().default(true),
  isPaused: boolean("is_paused").notNull().default(false),
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
