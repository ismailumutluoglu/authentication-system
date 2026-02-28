import logger from '../config/logger.js';

const errorMiddleware = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Sunucu hatası';

  // 500 hatalarını logla — bunlar beklenmeyen hatalar
  if (statusCode === 500) {
    logger.error(`${err.message} — ${req.method} ${req.originalUrl}`);
  }

  // 400/401 hatalarını warn olarak logla
  if (statusCode === 400 || statusCode === 401) {
    logger.warn(`${message} — ${req.method} ${req.originalUrl}`);
  }

  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Bu ${field} zaten kullanımda`;
  }

  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(err.errors)
      .map(e => e.message)
      .join(', ');
  }

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
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export default errorMiddleware;