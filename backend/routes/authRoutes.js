import express from 'express';
const router = express.Router();
import { register , login , getProfile, refreshAccessToken, logout , verifyEmail , forgotPassword, resetPassword , resendVerification } from '../controllers/authController.js';

import { loginLimiter, registerLimiter, refreshLimiter} from '../middleware/rateLimitMiddleware.js';
import { protect , requireEmailVerified } from '../middleware/authMiddleware.js';

router.post('/verify-email/:token', verifyEmail);
router.get('/profile', protect, getProfile); // protect middleware burada
router.post('/register',registerLimiter,register);
router.post('/login', loginLimiter,login);
router.post('/refresh',refreshLimiter,refreshAccessToken);
router.post('/logout',protect,logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.post('/resend-verification', protect, resendVerification);
export default router;