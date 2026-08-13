/**
 * logout.service.js — Revoke all sessions and clear refresh token.
 */
'use strict';

const sessionRepository = require('../repositories/session.repository');
const authRepository = require('../repositories/auth.repository');
const auditHelper = require('../../../shared/helpers/audit.helper');
const { AUDIT_ACTIONS, AUDIT_ENTITIES } = require('../../audit/constants/audit.constants');

/**
 * @param {Object} opts
 * @param {string} opts.userId
 * @param {Object} [opts.req]
 */
const logout = async ({ userId, req }) => {
  // Revoke all device sessions
  await sessionRepository.revokeAll(userId);

  // Clear refresh token stored on the user document (if any)
  await authRepository.removeRefreshToken(userId);

  // Audit
  await auditHelper.log({
    req,
    user: userId,
    action: AUDIT_ACTIONS.LOGOUT,
    entity: AUDIT_ENTITIES.AUTH,
    entityId: userId,
  });
};

module.exports = { logout };