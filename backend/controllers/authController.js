import User from "../models/User.js";
import AppError from '../utils/AppError.js';
import generateTokens from "../config/generateTokens.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../config/sendEmail.js';
import { verificationEmailTemplate } from '../config/emailTemplates.js';

// ─────────────────────────────────────
// REGISTER
// ─────────────────────────────────────
export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return next(new AppError('Tüm alanları doldurunuz', 400));
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return next(new AppError('Bu email zaten kayıtlı', 400));
    }

    const user = await User.create({ username, email, password });

    // Email doğrulama token'ı üret
    const verificationToken = crypto.randomBytes(32).toString('hex');
    user.emailVerificationToken = verificationToken;
    user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 saat

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    // Doğrulama emaili gönder
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email/${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Hesabınızı Doğrulayın',
      html: verificationEmailTemplate(user.username, verificationUrl),
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      message: 'Kayıt başarılı, lütfen emailinizi doğrulayın',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// LOGIN
// ─────────────────────────────────────
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(new AppError('Email ve şifre zorunludur', 400));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return next(new AppError('Email veya şifre hatalı', 401));
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return next(new AppError('Email veya şifre hatalı', 401));
    }

    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Giriş başarılı',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// GET PROFILE (Protected)
// ─────────────────────────────────────
export const getProfile = async (req, res, next) => {
  try {
    res.status(200).json({
      message: 'Profile erişim başarılı',
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// REFRESH ACCESS TOKEN
// ─────────────────────────────────────
export const refreshAccessToken = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return next(new AppError('Refresh token bulunamadı', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return next(new AppError('Kullanıcı bulunamadı', 401));
    }

    if (user.refreshToken !== token) {
      return next(new AppError('Geçersiz refresh token', 401));
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      message: 'Token yenilendi',
      accessToken,
    });

  } catch (error) {
    next(error); // TokenExpiredError ve JsonWebTokenError errorMiddleware'de yakalanır
  }
};

// ─────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(200).json({
        message: 'Zaten çıkış yapılmış'
      });
    }

    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    ).select('+refreshToken');

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({
      message: 'Çıkış başarılı'
    });

  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Token ile kullanıcıyı bul
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpire: { $gt: Date.now() }, // süresi dolmamış mı?
    }).select('+emailVerificationToken +emailVerificationExpire');

    if (!user) {
      return next(new AppError('Geçersiz veya süresi dolmuş doğrulama linki', 400));
    }

    // Hesabı aktif et, token'ları temizle
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Email başarıyla doğrulandı',
    });

  } catch (error) {
    next(error);
  }
};