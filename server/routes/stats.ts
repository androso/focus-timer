import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { WorkSessionController } from "../controllers/WorkSessionController";

const router = Router();

// Stats routes
router.get('/today', isAuthenticated, WorkSessionController.getTodayStats);
router.get('/weekly', isAuthenticated, WorkSessionController.getWeeklyStats);

export default router;