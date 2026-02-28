import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';

import connectDB from './config/db.js';
import logger from './config/logger.js';
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

app.use(morgan('dev', {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

app.use(express.json());
app.use(cookieParser());
app.use(mongoSanitizeMiddleware);
app.use(xssSanitize);
app.use('/api', generalLimiter);
app.use('/api/auth', authRouter);
app.use(errorMiddleware);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  logger.info(`Sunucu ${PORT} portunda çalışıyor`);
});