const errorMiddleware = (err, req, res, next) => {

  // Default değerler
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Sunucu hatası';

  // Mongoose duplicate key hatası (unique: true ihlali)
  // Örnek: aynı email ile tekrar kayıt
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Bu ${field} zaten kullanımda`;
  }

  // Mongoose validation hatası
  // Örnek: minlength ihlali, required alan boş
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

  // JWT hataları
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Geçersiz token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token süresi doldu';
  }

  res.status(statusCode).json({
    success: false,
    message,
    // Sadece development'ta stack trace göster
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorMiddleware;
