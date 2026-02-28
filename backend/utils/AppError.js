class AppError extends Error {
  constructor(message, statusCode) {
    super(message); // Error sınıfının constructor'ını çağır

    this.statusCode = statusCode;
    this.isOperational = true; // Bu bizim fırlattığımız bir hata

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;