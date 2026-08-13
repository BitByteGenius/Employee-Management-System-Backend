/**
 * oauth.service.js — OAuth (Google) authentication logic.
 */
'use strict';

const authRepository = require('../repositories/auth.repository');
const sessionRepository = require('../repositories/session.repository');
const Role = require('../models/role.model');
const { generateAccessToken, generateRefreshToken } = require('../../../shared/utils/jwt.util');
const AppError = require('../../../shared/errors/app.error');
const { HTTP_STATUS, ROLES } = require('../../../constants');
const env = require('../../../config/env');

const refreshTokenExpiry = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

const generateEmployeeCode = () => `EMP${Date.now().toString().slice(-6)}`;

/**
 * Handle Google OAuth payload.
 * Expects { googleId, email, firstName, lastName, profilePicture, idToken }
 */
const googleAuth = async ({ email, firstName, lastName, profilePicture, device = {}, req }) => {
  if (!email) {
    throw new AppError('Invalid Google authentication payload.', HTTP_STATUS.BAD_REQUEST);
  }

  const normalizedEmail = email.trim().toLowerCase();
  let user = await authRepository.findByEmail(normalizedEmail);

  if (!user) {
    // Determine default role
    const employeeRole = await Role.findOne({ name: ROLES.EMPLOYEE });
    if (!employeeRole) {
      throw new AppError('System error: Employee role not initialized.', HTTP_STATUS.INTERNAL_SERVER_ERROR);
    }

    user = await authRepository.createUser({
      employeeCode: generateEmployeeCode(),
      firstName: firstName || 'Google',
      lastName: lastName || 'User',
      email: normalizedEmail,
      password: `OAuth_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      profilePicture: profilePicture || null,
      role: employeeRole._id,
      status: 'pending',
      isActive: false,
      isApproved: false,
      isEmailVerified: true,
    });
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', HTTP_STATUS.FORBIDDEN);
  }

  if (!user.isApproved || user.status !== 'approved') {
    throw new AppError('Your account is registered via Google and pending Super Admin approval.', HTTP_STATUS.FORBIDDEN);
  }

  const roleName = user.role?.name || 'employee';
  const jwtPayload = {
    sub: user._id.toString(),
    role: roleName,
    email: user.email,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  await sessionRepository.create({
    user: user._id,
    refreshToken,
    deviceId: device.deviceId || 'unknown',
    deviceName: device.deviceName || 'Google OAuth Device',
    browser: device.browser || '',
    os: device.os || '',
    ipAddress: device.ipAddress || '',
    userAgent: device.userAgent || '',
    expiresAt: refreshTokenExpiry(),
  });

  await authRepository.updateLastLogin(user._id);

  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  };
};

module.exports = { googleAuth };
