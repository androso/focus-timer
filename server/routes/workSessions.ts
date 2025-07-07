import { Router } from "express";
import { 
  createWorkSession, 
  getUserWorkSessions,
  getUserWorkSessionsByDate 
} from "../controllers/WorkSessionController";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.post("/", isAuthenticated, createWorkSession);
router.get("/", isAuthenticated, getUserWorkSessions);
router.get("/date", isAuthenticated, getUserWorkSessionsByDate);

export default router;