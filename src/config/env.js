/**
 * Application environment configuration.
 * All process.env access is centralized here.
 * Never access process.env directly in services — use this file.
 */
const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Server
  PORT: Number(process.env.PORT) || 5000,

  // Database
  MONGO_URI: process.env.MONGODB_URI || process.env.MONGO_URI,

  // JWT
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '45m',
  JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',

  // Super Admin (from .env — never hard-coded)
  SUPER_ADMIN_EMAIL: (process.env.SUPER_ADMIN_EMAIL || 'superadmin@teamorbit.com').toLowerCase().trim(),
  SUPER_ADMIN_PASSWORD: process.env.SUPER_ADMIN_PASSWORD || '',
  SUPER_ADMIN_NAME: process.env.SUPER_ADMIN_NAME || 'Super Admin',

  // Client
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',

  // Email
  MAIL_FROM: process.env.MAIL_FROM || 'no-reply@teamorbit.com',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: Number(process.env.EMAIL_PORT) || 587,
};

module.exports = env;
