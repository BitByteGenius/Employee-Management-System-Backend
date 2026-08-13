/**
 * refresh-token.service.js — Rotate access + refresh tokens.
 *
 * Flow:
 *   1. Verify refresh token signature
 *   2. Find session by token
 *   3. Check session expiry
 *   4. If super admin session → re-issue without DB user lookup
 *   5. Otherwise look up user and issue new tokens
 *   6. Rotate token in session document
 */
'use strict';

const { verifyRefreshToken, generateAccessToken, generateRefreshToken } = require('../../../shared/utils/jwt.util');
const sessionRepository = require('../repositories/session.repository');
const authRepository = require('../repositories/auth.repository');
const AppError = require('../../../shared/errors/app.error');
const { HTTP_STATUS, PERMISSIONS } = require('../../../constants');
const env = require('../../../config/env');

const refresh = async (token) => {
  if (!token) {
    throw new AppError('Refresh token is required.', HTTP_STATUS.BAD_REQUEST);
  }

  // Verify signature
  let payload;
  try {
    payload = verifyRefreshToken(token);
  } catch {
    throw new AppError('Invalid or expired refresh token.', HTTP_STATUS.UNAUTHORIZED);
  }

  // Find session by token
  const session = await sessionRepository.findByRefreshToken(token);
  if (!session) {
    throw new AppError('Session not found or has been revoked.', HTTP_STATUS.UNAUTHORIZED);
  }

  if (session.isExpired()) {
    throw new AppError('Refresh token has expired.', HTTP_STATUS.UNAUTHORIZED);
  }

  /* ── Super Admin token rotation ─────────────────────────────────────── */
  if (payload.sub === 'super-admin') {
    const jwtPayload = { sub: 'super-admin', role: 'super_admin', email: payload.email };
    const newAccessToken = generateAccessToken(jwtPayload);
    const newRefreshToken = generateRefreshToken(jwtPayload);

    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    session.lastActiveAt = new Date();
    await session.save();

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      user: {
        id: 'super-admin',
        name: env.SUPER_ADMIN_NAME,
        email: payload.email,
        role: 'super_admin',
        permissions: Object.values(PERMISSIONS),
        isSuperAdmin: true,
      },
    };
  }

  /* ── Normal user token rotation ─────────────────────────────────────── */
  const user = await authRepository.findById(session.user);
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.UNAUTHORIZED);
  }

  const roleName = user.role?.name || 'employee';
  const jwtPayload = { sub: user._id.toString(), role: roleName, email: user.email };

  const newAccessToken = generateAccessToken(jwtPayload);
  const newRefreshToken = generateRefreshToken(jwtPayload);

  // Rotate session
  session.refreshToken = newRefreshToken;
  session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  session.lastActiveAt = new Date();
  await session.save();

  // Rotate on user document
  await authRepository.updateRefreshToken(user._id, newRefreshToken);

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    user: user.toSafeObject(),
  };
};

module.exports = { refresh };
