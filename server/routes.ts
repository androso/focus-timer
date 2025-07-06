import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./services/auth";
import apiRoutes from "./routes/index";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Mount all API routes
  app.use('/api', apiRoutes);

  const httpServer = createServer(app);
  return httpServer;
}
