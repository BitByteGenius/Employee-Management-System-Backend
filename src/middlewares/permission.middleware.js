/**
 * permission.middleware.js — Requires specific permissions on req.user.
 *
 * Super Admin always passes (has all permissions).
 *
 * Usage:
 *   router.get('/', authenticate, requirePermissions(PERMISSIONS.USERS_READ), controller.list);
 */
'use strict';

const AppError = require('../shared/errors/app.error');

const requirePermissions = (...permissions) => (req, res, next) => {
  // Super Admin bypasses permission checks
  if (req.user?.isSuperAdmin) return next();

  const granted = req.user?.permissions || [];
  const allowed = permissions.every((p) => granted.includes(p));

  if (!allowed) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  return next();
};

module.exports = requirePermissions;
