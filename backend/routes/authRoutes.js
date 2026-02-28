import express from 'express';
const router = express.Router();
import { register , login , getProfile, refreshAccessToken, logout} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';
import { loginLimiter, registerLimiter, refreshLimiter } from '../middleware/rateLimitMiddleware.js';

router.get('/profile', protect, getProfile); // protect middleware burada
router.post('/register',registerLimiter,register);
router.post('/login', loginLimiter,login);
router.post('/refresh',refreshLimiter,refreshAccessToken);
router.post('/logout',protect,logout);
export default router;