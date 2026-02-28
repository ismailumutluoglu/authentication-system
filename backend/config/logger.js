import winston from 'winston';

const { combine, timestamp, colorize, printf, json } = winston.format;

// ─────────────────────────────────────
// LOG FORMATI — terminalde okunabilir
// ─────────────────────────────────────
const consoleFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',

  transports: [
    // Terminal'e yaz
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: 'HH:mm:ss' }),
        consoleFormat
      )
    }),

    // Hataları dosyaya yaz
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      format: combine(
        timestamp(),
        json()
      )
    }),

    // Tüm logları dosyaya yaz
    new winston.transports.File({
      filename: 'logs/combined.log',
      format: combine(
        timestamp(),
        json()
      )
    }),
  ],
});

export default logger;