import express from 'express';
const router = express.Router();
import { register , login , getProfile, refreshAccessToken, logout} from '../controllers/authController.js';
import protect from '../middleware/authMiddleware.js';

router.get('/profile', protect, getProfile); // protect middleware burada
router.post('/register',register);
router.post('/login', login);
router.post('/refresh',refreshAccessToken);
router.post('/logout',protect,logout);
export default router;