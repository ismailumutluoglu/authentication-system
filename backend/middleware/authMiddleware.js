import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  try {
    // 1. Header'dan token'ı al
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        message: 'Yetkilendirme token\'ı bulunamadı' 
      });
    }

    // 2. "Bearer " kısmını at, sadece token'ı al
    const token = authHeader.split(' ')[1];

    // 3. Token'ı doğrula
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 4. Token'dan gelen id ile kullanıcıyı bul
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ 
        message: 'Kullanıcı bulunamadı' 
      });
    }

    // 5. Kullanıcıyı request'e ekle
    req.user = user;

    // 6. Sonraki adıma geç
    next();

  } catch (error) {
    // jwt.verify hata fırlatırsa buraya düşer
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token süresi doldu' 
      });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Geçersiz token' 
      });
    }
    res.status(500).json({ message: 'Sunucu hatası', error: error.message });
  }
};

export default protect;
