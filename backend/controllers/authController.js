import User from "../models/User.js";
import generateTokens from "../config/generateTokens.js";
import jwt from 'jsonwebtoken';

// LOGIN
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Alanlar dolu mu?
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email ve şifre zorunludur' 
      });
    }

    // 2. Kullanıcıyı bul — password'ü de getir
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ 
        message: 'Email veya şifre hatalı' 
      });
    }

    // 3. Şifreyi karşılaştır
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Email veya şifre hatalı' 
      });
    }

    // 4. Token üret
    const { accessToken, refreshToken } = generateTokens(user._id);

    // 5. Refresh token'ı DB'ye kaydet
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Refresh token'ı cookie'ye koy
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 7. Cevap dön
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
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// REGISTER
export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 1. Alanlar dolu mu?
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Tüm alanları doldurunuz' 
      });
    }

    // 2. Email daha önce kullanılmış mı?
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Bu email zaten kayıtlı' 
      });
    }

    // 3. Kullanıcıyı oluştur
    // (pre 'save' middleware burada devreye girer → şifreyi hash'ler)
    const user = await User.create({ username, email, password });

    // 4. Token üret
    const { accessToken, refreshToken } = generateTokens(user._id);

    // 5. Refresh token'ı DB'ye kaydet
    user.refreshToken = refreshToken;
    await user.save();

    // 6. Refresh token'ı HTTP-only cookie'ye koy
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 gün (ms cinsinden)
    });

    // 7. Cevap dön
    res.status(201).json({
      message: 'Kayıt başarılı',
      accessToken,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

// GET PROFILE (Protected)
export const getProfile = async (req, res) => {
  try {
    res.status(200).json({
      message: 'Profile erişim başarılı',
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

export const refreshAccessToken = async (req, res) => {
  try {
    // 1. Cookie'den refresh token'ı al
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ 
        message: 'Refresh token bulunamadı' 
      });
    }

    // 2. Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

    // 3. Kullanıcıyı bul — refreshToken'ı da getir
    const user = await User.findById(decoded.id).select('+refreshToken');
    if (!user) {
      return res.status(401).json({ 
        message: 'Kullanıcı bulunamadı' 
      });
    }

    // 4. DB'deki token ile gelen token aynı mı?
    if (user.refreshToken !== token) {
      return res.status(401).json({ 
        message: 'Geçersiz refresh token' 
      });
    }

    // 5. Yeni tokenları üret — Token Rotation!
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user._id);

    // 6. Yeni refresh token'ı DB'ye kaydet
    user.refreshToken = newRefreshToken;
    await user.save();

    // 7. Yeni refresh token'ı cookie'ye koy
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // 8. Yeni access token'ı dön
    res.status(200).json({
      message: 'Token yenilendi',
      accessToken,
    });

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Refresh token süresi doldu, lütfen tekrar giriş yapın' 
      });
    }
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
    // 1. Cookie'den refresh token'ı al
    const token = req.cookies.refreshToken;

    // 2. Cookie yoksa zaten logout olmuş
    if (!token) {
      return res.status(200).json({ 
        message: 'Zaten çıkış yapılmış' 
      });
    }

    // 3. DB'de bu token'a sahip kullanıcıyı bul ve temizle
    await User.findOneAndUpdate(
      { refreshToken: token },
      { refreshToken: null }
    ).select('+refreshToken');

    // 4. Cookie'yi temizle
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ 
      message: 'Çıkış başarılı' 
    });

  } catch (error) {
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};