import { type RequestHandler } from "express";

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // For Google OAuth, we don't need to handle token refresh
  // as the session-based approach handles this automatically
  return next();
};