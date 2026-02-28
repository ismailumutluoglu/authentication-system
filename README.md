# 🔐 Authentication System

Production-ready JWT tabanlı authentication sistemi. Node.js, Express, MongoDB ve React ile geliştirilmiştir.

---

## 📋 İçindekiler

- [Özellikler](#-özellikler)
- [Teknolojiler](#-teknolojiler)
- [Mimari](#-mimari)
- [Kurulum](#-kurulum)
- [API Referansı](#-api-referansı)
- [Güvenlik](#-güvenlik)
- [Proje Yapısı](#-proje-yapısı)

---

## ✨ Özellikler

- 🔑 **JWT Authentication** — Access Token (15dk) + Refresh Token (7gün) stratejisi
- 🔄 **Token Rotation** — Her refresh işleminde yeni token üretilir
- 📧 **Email Doğrulama** — Kayıt sonrası hesap aktivasyonu
- 🔒 **Şifre Sıfırlama** — Token tabanlı güvenli şifre sıfırlama akışı
- 🛡️ **Rate Limiting** — Brute force koruması
- 🧹 **Input Sanitization** — XSS ve NoSQL injection koruması
- 📋 **Loglama** — Morgan (HTTP) + Winston (uygulama) entegrasyonu
- ⚡ **Merkezi Error Handling** — Tutarlı hata yönetimi

---

## 🛠 Teknolojiler

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| Node.js | JavaScript runtime |
| Express.js | Web framework |
| MongoDB | NoSQL veritabanı |
| Mongoose | MongoDB ODM |
| JSON Web Token | Authentication |
| Bcryptjs | Şifre hash'leme |
| Nodemailer | Email gönderimi |
| Winston | Uygulama loglama |
| Morgan | HTTP loglama |
| express-rate-limit | Rate limiting |

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| React | UI kütüphanesi |
| React Router | Client-side routing |
| Axios | HTTP istemcisi |
| Tailwind CSS | Utility-first CSS |
| Vite | Build tool |

---

## 🏗 Mimari

### Authentication Akışı

```
Register / Login
      ↓
Access Token (15dk) → Client Memory
Refresh Token (7gün) → httpOnly Cookie + DB
      ↓
Her API isteğinde Access Token → Authorization Header
      ↓
Access Token süresi doldu → 401
      ↓
Axios Interceptor → POST /auth/refresh
      ↓
Yeni Token Seti → Token Rotation ✅
```

### Token Rotation

```
Refresh isteği geldi
      ↓
Eski refresh token geçersiz yapıldı
      ↓
Yeni access + refresh token üretildi
      ↓
Çalınan token kullanılmaya çalışılırsa → Engellendi ✅
```

---

## 🚀 Kurulum

### Gereksinimler

- Node.js v18+
- MongoDB
- Mailtrap hesabı (email testi için)

### 1. Repoyu Klonla

```bash
git clone https://github.com/ismailumutluoglu/authentication.git
cd authentication
```

### 2. Backend Kurulumu

```bash
cd backend
npm install
```

`.env` dosyası oluştur:

```env
PORT=
MONGO_URI=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRE=
JWT_REFRESH_EXPIRE=

EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=

CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

Backend'i başlat:

```bash
npm run dev
```

### 3. Frontend Kurulumu

```bash
cd frontend
npm install
npm run dev
```

---

## 📡 API Referansı

### Public Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/auth/register` | Yeni kullanıcı kaydı |
| `POST` | `/api/auth/login` | Kullanıcı girişi |
| `POST` | `/api/auth/refresh` | Access token yenileme |
| `POST` | `/api/auth/forgot-password` | Şifre sıfırlama emaili |
| `POST` | `/api/auth/reset-password/:token` | Yeni şifre belirleme |
| `POST` | `/api/auth/verify-email/:token` | Email doğrulama |

### Protected Endpoints

| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/auth/profile` | Kullanıcı profili |
| `POST` | `/api/auth/logout` | Çıkış yapma |
| `POST` | `/api/auth/resend-verification` | Doğrulama emaili tekrar gönder |

### Örnek İstekler

**Register**
```json
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "123456"
}
```

**Login**
```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "123456"
}
```

**Response**
```json
{
  "message": "Giriş başarılı",
  "accessToken": "eyJhbGc...",
  "user": {
    "id": "64abc123",
    "username": "johndoe",
    "email": "john@example.com",
    "isEmailVerified": true
  }
}
```

---

## 🔒 Güvenlik

### Katmanlar

| Katman | Açıklama |
|--------|----------|
| **httpOnly Cookie** | Refresh token JS ile okunamaz, XSS'e karşı koruma |
| **Token Rotation** | Her refresh'te yeni token, çalınan token geçersiz |
| **Kısa Access Token** | 15 dakika — çalınsa bile sınırlı zarar |
| **Rate Limiting** | Login: 5/15dk, Register: 10/saat, Genel: 100/15dk |
| **Input Sanitization** | XSS ve NoSQL injection engelleme |
| **User Enumeration** | Email/şifre hatalarında aynı mesaj |
| **select: false** | Şifre ve token'lar sorgularda otomatik gelmiyor |
| **sameSite: strict** | CSRF saldırılarına karşı koruma |

### Bcrypt

```
"sifre123" + rastgele salt → bcrypt (10 tur) → $2b$10$N9qo8...
```
- Tek yönlü hash — geri döndürülemez
- Her hash farklı salt ile üretilir
- Rainbow table saldırılarına karşı korumalı

---

## 📁 Proje Yapısı

```
auth-system/
├── backend/
│   ├── config/
│   │   ├── db.js                 # MongoDB bağlantısı
│   │   ├── generateTokens.js     # JWT üretimi
│   │   ├── logger.js             # Winston loglama
│   │   ├── sendEmail.js          # Nodemailer
│   │   └── emailTemplates.js     # HTML email şablonları
│   ├── controllers/
│   │   └── authController.js     # İş mantığı
│   ├── middleware/
│   │   ├── authMiddleware.js     # JWT doğrulama
│   │   ├── errorMiddleware.js    # Merkezi hata yönetimi
│   │   ├── rateLimitMiddleware.js# Rate limiting
│   │   └── sanitizeMiddleware.js # XSS & NoSQL koruması
│   ├── models/
│   │   └── User.js               # Kullanıcı şeması
│   ├── routes/
│   │   └── authRoutes.js         # API route'ları
│   ├── utils/
│   │   └── AppError.js           # Custom error sınıfı
│   └── server.js                 # Uygulama giriş noktası
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js          # Axios instance & interceptor
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── components/
    │   │   └── PrivateRoute.jsx  # Korumalı route wrapper
    │   └── pages/
    │       ├── Login.jsx
    │       ├── Register.jsx
    │       ├── Dashboard.jsx
    │       ├── ForgotPassword.jsx
    │       ├── ResetPassword.jsx
    │       ├── VerifyEmail.jsx
    │       └── VerifyEmailNotice.jsx
    └── ...
```

---

## 📊 Sistem Şeması

👉 [Authentication System Şemasını Görüntüle](./docs/auth-schema.html)

---

## 👤 Geliştirici

**İsmail Umut Luoğlu**

[![GitHub](https://img.shields.io/badge/GitHub-ismailumutluoglu-181717?style=flat&logo=github)](https://github.com/ismailumutluoglu)