import User from "../models/User.js";
import generateTokens from "../config/generateTokens.js";

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