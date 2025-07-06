import { Router } from "express";
import authRoutes from "./auth";
import workSessionRoutes from "./workSessions";
import statsRoutes from "./stats";
import timerSettingsRoutes from "./timerSettings";

const router = Router();

// Mount all route modules
router.use('/auth', authRoutes);
router.use('/work-sessions', workSessionRoutes);
router.use('/stats', statsRoutes);
router.use('/timer-settings', timerSettingsRoutes);

export default router;