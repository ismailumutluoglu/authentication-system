import nodemailer from 'nodemailer';
import logger from './logger.js';

// Bir kere oluştur, her yerde kullan
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: `"Auth System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });

    logger.info(`Email gönderildi: ${to}`);
  } catch (error) {
    logger.error(`Email gönderilemedi: ${error.message}`);
    throw error;
  }
};

export default sendEmail;