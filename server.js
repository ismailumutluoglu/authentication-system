import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
dotenv.config();

connectDB();

const app = express();

// --- MIDDLEWARE'LER ---
// Gelen JSON body'leri okuyabilmek için
app.use(express.json());
// Gelen cookie'leri okuyabilmek için
app.use(cookieParser());

// --- ROUTES ---
app.use('/api/v1/auth',authRouter);

// --- SUNUCUYU BAŞLAT ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});