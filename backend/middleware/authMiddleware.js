import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AppError from '../utils/AppError.js';

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Yetkilendirme tokenı bulunamadı', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('Kullanıcı bulunamadı', 401));
    }

    req.user = user;
    next();

  } catch (error) {
    next(error); // TokenExpiredError ve JsonWebTokenError errorMiddleware'de yakalanır
  }
};

export const requireEmailVerified = (req, res, next) => {
  if (!req.user.isEmailVerified) {
    return next(new AppError('Lütfen önce email adresinizi doğrulayın', 403));
  }
  next();
};