/**
 * auth.controller.js — HTTP layer for authentication.
 *
 * Rules:
 *   ✓ Receive request
 *   ✓ Delegate to service
 *   ✓ Return standardized response
 *   ✗ No business logic
 *   ✗ No direct DB access
 */
'use strict';

const asyncHandler = require('../../../shared/utils/async-handler.util');
const ApiResponse = require('../../../shared/responses/api-response');
const { HTTP_STATUS } = require('../../../constants');

const registerService = require('../services/register.service');
const loginService = require('../services/login.service');
const logoutService = require('../services/logout.service');
const refreshTokenService = require('../services/refresh-token.service');
const changePasswordService = require('../services/change-password.service');
const forgotPasswordService = require('../services/forgot-password.service');
const resetPasswordService = require('../services/reset-password.service');

// ─── Register ────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const user = await registerService.register(req.body);
  res.status(HTTP_STATUS.CREATED).json(
    new ApiResponse(HTTP_STATUS.CREATED, 'User registered successfully.', user),
  );
});

// ─── Login ───────────────────────────────────────────────────────────────────
const login = asyncHandler(async (req, res) => {
  const result = await loginService.login({
    email: req.body.email,
    password: req.body.password,
    req,
    device: {
      deviceId: req.headers['x-device-id'] || 'unknown',
      deviceName: req.headers['x-device-name'] || 'Unknown Device',
      browser: '',
      os: '',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    },
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Login successful.', result),
  );
});

// ─── Refresh Token ───────────────────────────────────────────────────────────
const refreshToken = asyncHandler(async (req, res) => {
  const token = req.body.refreshToken;
  const result = await refreshTokenService.refresh(token);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Token refreshed successfully.', result),
  );
});

// ─── Me ──────────────────────────────────────────────────────────────────────
const me = asyncHandler(async (req, res) => {
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Profile retrieved successfully.', req.user),
  );
});

// ─── Logout ──────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  await logoutService.logout({ userId: req.user.id, req });
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Logged out successfully.'),
  );
});

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPassword = asyncHandler(async (req, res) => {
  await forgotPasswordService.sendResetLink(req.body.email);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'If that email exists, a reset link has been sent.'),
  );
});

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPassword = asyncHandler(async (req, res) => {
  await resetPasswordService.reset(req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Password reset successfully.'),
  );
});

// ─── Change Password ─────────────────────────────────────────────────────────
const changePassword = asyncHandler(async (req, res) => {
  await changePasswordService.changePassword(req.user.id, req.body);
  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Password changed successfully.'),
  );
});

const oauthService = require('../services/oauth.service');

// ─── Google OAuth ────────────────────────────────────────────────────────────
const googleAuth = asyncHandler(async (req, res) => {
  const result = await oauthService.googleAuth({
    email: req.body.email,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    profilePicture: req.body.profilePicture,
    req,
    device: {
      deviceId: req.headers['x-device-id'] || 'unknown',
      deviceName: req.headers['x-device-name'] || 'Google OAuth',
      browser: '',
      os: '',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'] || '',
    },
  });

  res.status(HTTP_STATUS.OK).json(
    new ApiResponse(HTTP_STATUS.OK, 'Google authentication successful.', result),
  );
});

module.exports = {
  register,
  login,
  googleAuth,
  refreshToken,
  me,
  logout,
  forgotPassword,
  resetPassword,
  changePassword,
};