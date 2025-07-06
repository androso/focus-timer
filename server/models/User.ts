import {
  users,
  type User,
  type UpsertUser,
} from "@shared/schema";
import { db } from "../config/database";
import { eq } from "drizzle-orm";

export class UserModel {
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  static async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  static async upsertUser(userData: UpsertUser): Promise<User> {
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
}