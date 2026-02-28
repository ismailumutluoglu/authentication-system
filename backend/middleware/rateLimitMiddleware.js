import rateLimit from 'express-rate-limit';

// ─────────────────────────────────────
// GENEL LİMİT — tüm API
// ─────────────────────────────────────
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100,                  // 100 istek
  message: {
    success: false,
    message: 'Çok fazla istek gönderdiniz. 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,  // RateLimit-* headerları ekle
  legacyHeaders: false,   // X-RateLimit-* headerlarını kaldır
});

// ─────────────────────────────────────
// LOGIN LİMİTİ — en kritik
// ─────────────────────────────────────
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5,                    // 5 deneme hakkı
  message: {
    success: false,
    message: 'Çok fazla başarısız giriş denemesi. 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────
// REGISTER LİMİTİ
// ─────────────────────────────────────
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 10,                   // 10 kayıt denemesi
  message: {
    success: false,
    message: 'Çok fazla kayıt denemesi. 1 saat sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ─────────────────────────────────────
// REFRESH LİMİTİ
// ─────────────────────────────────────
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 20,                   // 20 istek
  message: {
    success: false,
    message: 'Çok fazla token yenileme isteği. 15 dakika sonra tekrar deneyin.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});