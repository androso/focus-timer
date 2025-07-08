import { Router } from "express";
import { WorkSessionController } from "../controllers/WorkSessionController";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

router.post("/", isAuthenticated, WorkSessionController.createWorkSession);
router.get("/", isAuthenticated, WorkSessionController.getWorkSessions);
router.get("/date", isAuthenticated, WorkSessionController.getWorkSessionsByDate);
router.delete("/:id", isAuthenticated, WorkSessionController.deleteWorkSession);

export default router;