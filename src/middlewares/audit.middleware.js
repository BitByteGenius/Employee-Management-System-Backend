/**
 * audit.middleware.js — Fire-and-forget audit log on successful responses.
 *
 * Usage:
 *   router.patch('/:id/approve', authenticate, auditMiddleware('user.approve', 'User'), controller.approve);
 */
'use strict';

const AuditLog = require('../modules/audit/models/audit-log.model');

/**
 * @param {string} action      - e.g. 'user.approve'
 * @param {string} entityType  - e.g. 'User'
 * @param {Function} [getEntityId] - Extracts entity ID from req. Defaults to req.params.id
 */
const auditMiddleware = (action, entityType, getEntityId = (req) => req.params.id) =>
  async (req, res, next) => {
    res.on('finish', async () => {
      if (res.statusCode >= 400) return;
      await AuditLog.create({
        actor: req.user?.id || null,
        action,
        entityType,
        entityId: getEntityId(req),
        ip: req.ip,
        userAgent: req.headers['user-agent'],
        metadata: { method: req.method, path: req.originalUrl },
      }).catch(() => {}); // Never throw
    });
    next();
  };

module.exports = auditMiddleware;
