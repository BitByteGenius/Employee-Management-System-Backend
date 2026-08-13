/**
 * change-password.service.js — Authenticated password change.
 */
'use strict';

const authRepository = require('../repositories/auth.repository');
const { comparePassword } = require('../../../shared/utils/password.util');
const AppError = require('../../../shared/errors/app.error');
const { HTTP_STATUS } = require('../../../constants');

/**
 * @param {string} userId
 * @param {Object} opts
 * @param {string} opts.currentPassword
 * @param {string} opts.newPassword
 */
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await authRepository.findByIdWithPassword(userId);
  if (!user) {
    throw new AppError('User not found.', HTTP_STATUS.NOT_FOUND);
  }

  const isMatch = await comparePassword(currentPassword, user.password);
  if (!isMatch) {
    throw new AppError('Incorrect current password.', HTTP_STATUS.BAD_REQUEST);
  }

  // updatePassword uses user.save() which triggers pre-save hash middleware
  await authRepository.updatePassword(userId, newPassword);
};

module.exports = { changePassword };
