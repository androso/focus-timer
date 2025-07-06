import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { WorkSessionController } from "../controllers/WorkSessionController";

const router = Router();

// Work session routes
router.post('/', isAuthenticated, WorkSessionController.createWorkSession);
router.get('/', isAuthenticated, WorkSessionController.getWorkSessions);
router.get('/by-date', isAuthenticated, WorkSessionController.getWorkSessionsByDate);
router.get('/by-date-range', isAuthenticated, WorkSessionController.getWorkSessionsByDateRange);

export default router;