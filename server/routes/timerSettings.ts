import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { TimerSettingsController } from "../controllers/TimerSettingsController";

const router = Router();

// Timer settings routes
router.get('/', isAuthenticated, TimerSettingsController.getTimerSettings);
router.post('/', isAuthenticated, TimerSettingsController.upsertTimerSettings);

export default router;