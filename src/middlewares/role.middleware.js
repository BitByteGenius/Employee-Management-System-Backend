/**
 * role.middleware.js — Restricts routes to specific roles.
 *
 * Usage:
 *   router.delete('/:id', authenticate, allowRoles('super_admin', 'admin'), controller.remove);
 */
'use strict';

const AppError = require('../shared/errors/app.error');

const allowRoles = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new AppError('Insufficient role privileges.', 403));
  }
  return next();
};

module.exports = allowRoles;
