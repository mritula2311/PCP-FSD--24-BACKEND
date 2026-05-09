import express from 'express';
import { registerUser, loginUser, getUserProfile, getAllAgents, updateAgentSkills } from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { authRateLimiter } from '../middleware/rate-limit.middleware.js';

const router = express.Router();

router.post('/register', authRateLimiter, registerUser);
router.post('/login', authRateLimiter, loginUser);
router.get('/me', protect, getUserProfile);
router.get('/agents', protect, requireRole('AGENT'), getAllAgents);
router.patch('/skills', protect, requireRole('AGENT'), updateAgentSkills);

export default router;
