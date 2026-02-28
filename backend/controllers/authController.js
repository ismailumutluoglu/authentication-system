import User from "../models/User.js";
import AppError from '../utils/AppError.js';
import generateTokens from "../config/generateTokens.js";
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import sendEmail from '../config/sendEmail.js';
import { verificationEmailTemplate, passwordResetEmailTemplate } from "../config/emailTemplates.js";

// ─────────────────────────────────────
// HELPERS
// ─────────────────────────────────────
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const CLEAR_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict',
};

const sendVerificationEmail = async (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  user.emailVerificationToken = token;
  user.emailVerificationExpire = Date.now() + 24 * 60 * 60 * 1000;
  const url = `${process.env.CLIENT_URL}/verify-email/${token}`;
  await sendEmail({
    to: user.email,
    subject: 'Hesabınızı Doğrulayın',
    html: verificationEmailTemplate(user.username, url),
  });
};

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
    const { accessToken, refreshToken } = generateTokens(user._id);
    user.refreshToken = refreshToken;

    await sendVerificationEmail(user);
    await user.save();

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
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

    res.cookie('refreshToken', refreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      message: 'Giriş başarılı',
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
// GET PROFILE
// ─────────────────────────────────────
export const getProfile = (req, res) => {
  res.status(200).json({
    message: 'Profile erişim başarılı',
    user: req.user,
  });
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

    res.cookie('refreshToken', newRefreshToken, COOKIE_OPTIONS);
    res.status(200).json({
      message: 'Token yenilendi',
      accessToken,
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────
export const logout = async (req, res, next) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(200).json({ message: 'Zaten çıkış yapılmış' });
    }

    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    );

    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
    res.status(200).json({ message: 'Çıkış başarılı' });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// VERIFY EMAIL
// ─────────────────────────────────────
export const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
    }).select('+emailVerificationToken +emailVerificationExpire');

    if (!user) {
      return next(new AppError('Geçersiz doğrulama linki', 400));
    }

    if (user.isEmailVerified) {
      return res.status(200).json({ success: true, message: 'Email zaten doğrulanmış' });
    }

    if (user.emailVerificationExpire < Date.now()) {
      return next(new AppError('Doğrulama linkinin süresi dolmuş', 400));
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: 'Email başarıyla doğrulandı' });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// FORGOT PASSWORD
// ─────────────────────────────────────
export const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return next(new AppError('Email zorunludur', 400));
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'Şifre sıfırlama linki emailinize gönderildi',
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpire = Date.now() + 60 * 60 * 1000;
    await user.save();

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Şifre Sıfırlama',
      html: passwordResetEmailTemplate(user.username, resetUrl),
    });

    res.status(200).json({
      success: true,
      message: 'Şifre sıfırlama linki emailinize gönderildi',
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// RESET PASSWORD
// ─────────────────────────────────────
export const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
      return next(new AppError('Yeni şifre zorunludur', 400));
    }

    if (password.length < 6) {
      return next(new AppError('Şifre en az 6 karakter olmalıdır', 400));
    }

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpire: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpire');

    if (!user) {
      return next(new AppError('Geçersiz veya süresi dolmuş şifre sıfırlama linki', 400));
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpire = undefined;
    user.refreshToken = null;
    await user.save();

    res.clearCookie('refreshToken', CLEAR_COOKIE_OPTIONS);
    res.status(200).json({
      success: true,
      message: 'Şifre başarıyla sıfırlandı, lütfen tekrar giriş yapın',
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────
// RESEND VERIFICATION
// ─────────────────────────────────────
export const resendVerification = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .select('+emailVerificationToken +emailVerificationExpire');

    if (user.isEmailVerified) {
      return next(new AppError('Email zaten doğrulanmış', 400));
    }

    await sendVerificationEmail(user);
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Doğrulama emaili tekrar gönderildi',
    });

  } catch (error) {
    next(error);
  }
};