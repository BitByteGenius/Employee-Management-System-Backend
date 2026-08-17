/**
 * auth.middleware.js — JWT authentication guard.
 *
 * Attaches req.user with:
 *   { id, role (string), permissions (string[]), email, name, isSuperAdmin? }
 *
 * Compatible with both super admin tokens (sub = 'super-admin')
 * and normal user tokens (sub = MongoDB ObjectId).
 */
'use strict';

const jwt = require('jsonwebtoken');
const User = require('../modules/user/models/user.model');
const AppError = require('../shared/errors/app.error');
const asyncHandler = require('../shared/utils/async-handler.util');
const { HTTP_STATUS, PERMISSIONS } = require('../constants');
const env = require('../config/env');

const authenticate = asyncHandler(async (req, res, next) => {
  // Extract token from Authorization header or cookie
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : req.cookies?.accessToken;

  if (!token) {
    throw new AppError('Authentication required.', HTTP_STATUS.UNAUTHORIZED);
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
  } catch (err) {
    throw new AppError(
      err.name === 'TokenExpiredError' ? 'Access token has expired.' : 'Invalid token.',
      HTTP_STATUS.UNAUTHORIZED,
    );
  }

  /* ── Authenticate User via MongoDB ─────────────────────────────────── */
  if (payload.sub === 'super_admin_dev' && payload.role === 'super_admin') {
    req.user = {
      id: 'super_admin_dev',
      _id: 'super_admin_dev',
      role: 'super_admin',
      permissions: Object.values(PERMISSIONS),
      email: payload.email || env.SUPER_ADMIN_EMAIL,
      name: env.SUPER_ADMIN_NAME,
      firstName: env.SUPER_ADMIN_NAME.split(' ')[0],
      lastName: env.SUPER_ADMIN_NAME.split(' ').slice(1).join(' ') || 'Admin',
      isSuperAdmin: true,
    };

    return next();
  }

  const user = await User.findById(payload.sub).populate('role').lean();

  if (!user) {
    throw new AppError('User not found or account deleted.', HTTP_STATUS.UNAUTHORIZED);
  }

  if (!user.isActive) {
    throw new AppError('Your account has been deactivated.', HTTP_STATUS.FORBIDDEN);
  }

  if (!user.isApproved || user.status !== 'approved') {
    throw new AppError('Your account is not approved.', HTTP_STATUS.FORBIDDEN);
  }

  const roleName = user.role?.name || 'employee';
  const isSuperAdmin = roleName === 'super_admin';
  const permissions = isSuperAdmin ? Object.values(PERMISSIONS) : (user.role?.permissions || []);

  req.user = {
    id: user._id.toString(),
    _id: user._id.toString(),
    role: roleName,
    permissions,
    email: user.email,
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    department: user.department,
    employeeCode: user.employeeCode,
    isSuperAdmin,
  };

  return next();
});

module.exports = authenticate;
