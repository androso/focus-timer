import { Router } from "express";
import userRoutes from "./user";
import workSessionRoutes from "./workSessions";
import statsRoutes from "./stats";
import timerSettingsRoutes from "./timerSettings";
import activeTimerSessionRoutes from "./activeTimerSessions";

const router = Router();

// Mount all route modules
router.use('/auth', userRoutes);
router.use('/work-sessions', workSessionRoutes);
router.use('/stats', statsRoutes);
router.use('/timer-settings', timerSettingsRoutes);
router.use('/active-timer-session', activeTimerSessionRoutes);

export default router;