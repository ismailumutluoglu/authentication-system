import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors' ; 
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import errorMiddleware from './middleware/errorMiddleware.js';
import { generalLimiter } from './middleware/rateLimitMiddleware.js';
import { mongoSanitizeMiddleware, xssSanitize } from './middleware/sanitizeMiddleware.js';
dotenv.config();

connectDB();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
// --- MIDDLEWARE'LER ---
// Gelen JSON body'leri okuyabilmek için
app.use(express.json());
// Gelen cookie'leri okuyabilmek için
app.use(cookieParser());
app.use(mongoSanitizeMiddleware); // ← NoSQL injection
app.use(xssSanitize);            // ← XSS
// ─── Genel limit — tüm /api route'larına ───
app.use('/api', generalLimiter);
// --- ROUTES ---
app.use('/api/auth',authRouter);
app.use(errorMiddleware);
// --- SUNUCUYU BAŞLAT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});