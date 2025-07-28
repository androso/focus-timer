import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from "@shared/schema";
import "dotenv/config";
import { config } from "../config";

export const client = createClient({
  url: config.db.url,
  authToken: config.db.authToken,
});

export const db = drizzle(client, { schema });