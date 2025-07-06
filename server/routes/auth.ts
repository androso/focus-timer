import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";
import { UserController } from "../controllers/UserController";

const router = Router();

// Auth routes
router.get('/user', isAuthenticated, UserController.getCurrentUser);

export default router;