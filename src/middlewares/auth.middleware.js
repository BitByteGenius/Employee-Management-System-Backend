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

const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('../modules/user/models/user.model');
const Role = require('../models/Role');
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

  /* ── Authenticate Super Admin / Dev Token via MongoDB ───────────────────────────── */
  if (payload.sub === 'super_admin_dev' || payload.sub === 'super-admin' || (payload.role === 'super_admin' && !mongoose.Types.ObjectId.isValid(payload.sub))) {
    let superAdminUser = await User.findOne({ email: env.SUPER_ADMIN_EMAIL }).populate('role').lean();
    if (!superAdminUser) {
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
      superAdminUser = await User.create({
        employeeCode: 'SA-001',
        firstName: env.SUPER_ADMIN_NAME.split(' ')[0] || 'Super',
        lastName: env.SUPER_ADMIN_NAME.split(' ').slice(1).join(' ') || 'Admin',
        fullName: env.SUPER_ADMIN_NAME,
        email: env.SUPER_ADMIN_EMAIL,
        password: await hashPassword(env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123'),
        role: superAdminRole._id,
        isActive: true,
        isApproved: true,
        status: 'approved',
        isEmailVerified: true,
      });
    }

    const userId = (superAdminUser._id || superAdminUser.id).toString();
    req.user = {
      id: userId,
      _id: userId,
      role: 'super_admin',
      permissions: Object.values(PERMISSIONS),
      email: superAdminUser.email || env.SUPER_ADMIN_EMAIL,
      name: superAdminUser.fullName || env.SUPER_ADMIN_NAME,
      firstName: superAdminUser.firstName || 'Super',
      lastName: superAdminUser.lastName || 'Admin',
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
