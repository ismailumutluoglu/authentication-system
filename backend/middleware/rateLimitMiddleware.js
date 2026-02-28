import rateLimit from 'express-rate-limit';

const defaultOptions = {
  standardHeaders: true,
  legacyHeaders: false,
};

export const generalLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. 15 dakika sonra tekrar deneyin.',
  },
});

export const loginLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Çok fazla giriş denemesi. 15 dakika sonra tekrar deneyin.',
  },
});

export const registerLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Çok fazla kayıt denemesi. 1 saat sonra tekrar deneyin.',
  },
});

export const refreshLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    message: 'Çok fazla token yenileme isteği. 15 dakika sonra tekrar deneyin.',
  },
});