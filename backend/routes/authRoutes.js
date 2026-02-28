import express from 'express';
import { 
  register, login, getProfile, 
  refreshAccessToken, logout, 
  verifyEmail, forgotPassword, 
  resetPassword, resendVerification 
} from '../controllers/authController.js';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middleware/rateLimitMiddleware.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ─── Public Routes ───
router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/refresh', refreshLimiter, refreshAccessToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/verify-email/:token', verifyEmail);

// ─── Protected Routes ───
router.get('/profile', protect, getProfile);
router.post('/logout', protect, logout);
router.post('/resend-verification', protect, resendVerification);

export default router;