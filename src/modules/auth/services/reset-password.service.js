/**
 * reset-password.service.js — Update password using a short-lived reset token.
 */
'use strict';

const jwt = require('jsonwebtoken');
const authRepository = require('../repositories/auth.repository');
const AppError = require('../../../shared/errors/app.error');
const env = require('../../../config/env');
const { HTTP_STATUS } = require('../../../constants');

/**
 * @param {Object} opts
 * @param {string} opts.token     - JWT reset token
 * @param {string} opts.password  - New password
 */
const reset = async ({ token, password }) => {
  let payload;
  try {
    payload = jwt.verify(token, env.JWT_ACCESS_SECRET);
  } catch {
    throw new AppError('Invalid or expired reset token.', HTTP_STATUS.UNAUTHORIZED);
  }

  const user = await authRepository.findById(payload.sub);
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  await authRepository.updatePassword(user._id, password);
};

module.exports = { reset };
