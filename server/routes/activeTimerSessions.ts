import { Router } from 'express';
import { ActiveTimerSessionController } from '../controllers/ActiveTimerSessionController';
import { isAuthenticated } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(isAuthenticated);

// Get active timer session
router.get('/', ActiveTimerSessionController.getActiveSession);

// Create new active timer session
router.post('/', ActiveTimerSessionController.createActiveSession);

// Update active timer session
router.patch('/', ActiveTimerSessionController.updateActiveSession);

// Stop and save active timer session
router.post('/stop', ActiveTimerSessionController.stopAndSaveSession);

// Remove active timer session without saving
router.delete('/', ActiveTimerSessionController.removeActiveSession);

export default router;