/**
 * login.service.js — Authentication (login) business logic.
 *
 * Flow:
 *   1. Check if Super Admin credentials → issue tokens from .env
 *   2. Normal user → find in DB → validate → create session → issue tokens
 */
'use strict';

const authRepository = require('../repositories/auth.repository');
const sessionRepository = require('../repositories/session.repository');
const { comparePassword } = require('../../../shared/utils/password.util');
const { generateAccessToken, generateRefreshToken } = require('../../../shared/utils/jwt.util');
const auditHelper = require('../../../shared/helpers/audit.helper');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../../audit/constants/audit.constants');
const AppError = require('../../../shared/errors/app.error');
const { HTTP_STATUS, AUTH, PERMISSIONS } = require('../../../constants');
const env = require('../../../config/env');

/**
 * Refresh token expiry in ms (default 7 days).
 */
const refreshTokenExpiry = () =>
  new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

/**
 * @param {Object} opts
 * @param {string} opts.email
 * @param {string} opts.password
 * @param {Object} [opts.device]  - { deviceId, deviceName, browser, os, ipAddress, userAgent }
 * @param {Object} [opts.req]     - Express request (for audit logging)
 * @returns {Promise<{ accessToken, refreshToken, user }>}
 */
const login = async ({ email, password, device = {}, req }) => {
  const normalizedEmail = email?.trim().toLowerCase();

  const Role = require('../../../models/Role');
  const User = require('../../user/models/user.model');
  const { hashPassword } = require('../../../shared/utils/password.util');

  // ─── Super Admin credentials lookup ───
  if (normalizedEmail === env.SUPER_ADMIN_EMAIL && password === env.SUPER_ADMIN_PASSWORD) {
    console.log('[Auth] Super Admin login authenticated');

    let superAdminRole = await Role.findOne({ name: 'super_admin' });
    if (!superAdminRole) {
      superAdminRole = await Role.create({
        name: 'super_admin',
        label: 'Super Admin',
        description: 'Full system access',
        permissions: Object.values(PERMISSIONS),
        isSystem: true,
      });
    }

    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      user = await User.create({
        employeeCode: 'SA-001',
        firstName: env.SUPER_ADMIN_NAME.split(' ')[0] || 'Super',
        lastName: env.SUPER_ADMIN_NAME.split(' ').slice(1).join(' ') || 'Admin',
        fullName: env.SUPER_ADMIN_NAME,
        email: normalizedEmail,
        password: await hashPassword(password),
        role: superAdminRole._id,
        isActive: true,
        isApproved: true,
        status: 'approved',
        isEmailVerified: true,
      });
    }

    const jwtPayload = {
      sub: user._id.toString(),
      role: 'super_admin',
      email: normalizedEmail,
    };

    const accessToken = generateAccessToken(jwtPayload);
    const refreshToken = generateRefreshToken(jwtPayload);

    return {
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        _id: user._id.toString(),
        name: user.fullName || env.SUPER_ADMIN_NAME,
        fullName: user.fullName || env.SUPER_ADMIN_NAME,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: 'super_admin',
        permissions: Object.values(PERMISSIONS),
        isActive: true,
        isApproved: true,
        status: 'approved',
        accountStatus: 'approved',
      },
    };
  }

  // ─── Normal database lookup ───
  let user;
  try {
    user = await authRepository.findByEmail(normalizedEmail);
  } catch (dbError) {
    console.error('[Auth] Database error during login:', dbError.message);
    throw new AppError('Database connection failed. Please try again.', HTTP_STATUS.SERVICE_UNAVAILABLE);
  }

  if (!user) {
    throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isApproved || user.status !== 'approved') {
    throw new AppError('Account pending approval. Please wait for Super Admin approval.', HTTP_STATUS.FORBIDDEN);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', HTTP_STATUS.FORBIDDEN);
  }

  if (user.isLocked()) {
    throw new AppError(
      'Your account is temporarily locked due to multiple failed login attempts.',
      HTTP_STATUS.TOO_MANY_REQUESTS,
    );
  }

  const validPassword = await comparePassword(password, user.password);

  if (!validPassword) {
    await authRepository.incrementLoginAttempts(user._id);

    if (user.loginAttempts + 1 >= AUTH.LOGIN.MAX_ATTEMPTS) {
      await authRepository.lockAccount(
        user._id,
        new Date(Date.now() + AUTH.LOGIN.LOCK_TIME),
      );
    }

    throw new AppError('Invalid email or password.', HTTP_STATUS.UNAUTHORIZED);
  }

  await authRepository.resetLoginAttempts(user._id);

  /* ── JWT ─────────────────────────────────────────────────────────────── */
  const sysRole = user.systemRole || (
    user.role?.name?.toUpperCase().includes('SUPER') ? 'SUPER_ADMIN' : (user.role?.name?.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'EMPLOYEE')
  );
  const isSuperAdmin = sysRole === 'SUPER_ADMIN' || user.role?.name === 'super_admin';
  const roleName = isSuperAdmin ? 'super_admin' : (sysRole === 'ADMIN' ? 'admin' : 'employee');

  const jwtPayload = {
    sub: user._id.toString(),
    role: roleName,
    systemRole: sysRole,
    email: user.email,
  };

  const accessToken = generateAccessToken(jwtPayload);
  const refreshToken = generateRefreshToken(jwtPayload);

  /* ── Session ─────────────────────────────────────────────────────────── */
  await sessionRepository.create({
    user: user._id,
    refreshToken,
    deviceId: device.deviceId || 'unknown',
    deviceName: device.deviceName || 'Unknown Device',
    browser: device.browser || '',
    os: device.os || '',
    ipAddress: device.ipAddress || '',
    userAgent: device.userAgent || '',
    expiresAt: refreshTokenExpiry(),
  });

  await authRepository.updateLastLogin(user._id);

  /* ── Audit ───────────────────────────────────────────────────────────── */
  await auditHelper.log({
    req,
    user: user._id,
    action: AUDIT_ACTIONS.LOGIN,
    entity: AUDIT_ENTITIES.AUTH,
    entityId: user._id,
  });

  /* ── Response ────────────────────────────────────────────────────────── */
  return {
    accessToken,
    refreshToken,
    user: user.toSafeObject(),
  };
};

module.exports = { login };
