/**
 * forgot-password.service.js — Send password reset link via email.
 *
 * Note: Email sending is not yet wired (no SMTP credentials in .env).
 * The reset URL is logged to console in dev mode.
 * Wire nodemailer here when SMTP config is available.
 */
'use strict';

const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const AppError = require('../../../shared/errors/app.error');
const Logger = require('../../../shared/logger/logger');
const env = require('../../../config/env');
const { HTTP_STATUS } = require('../../../constants');

/**
 * @param {string} email
 */
const sendResetLink = async (email) => {
  const user = await authRepository.findByEmail(email);

  // Always respond with 200 to prevent email enumeration
  if (!user) {
    Logger.info(`[Forgot Password] No account found for: ${email}`);
    return;
  }

  const resetToken = jwt.sign(
    { sub: user._id.toString(), email: user.email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: '15m' },
  );

  const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // TODO: Replace with actual email sending via nodemailer
  Logger.info(`[Forgot Password] Reset link for ${email}: ${resetUrl}`);
};

module.exports = { sendResetLink };
