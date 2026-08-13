/**
 * Audit Helper — fire-and-forget audit log creation.
 * Never throws — audit logging must not crash the application.
 */
const AuditLog = require('../../modules/audit/models/audit-log.model');

/**
 * @param {Object} opts
 * @param {Object}  [opts.req]       - Express request (for ip/userAgent)
 * @param {*}       [opts.user]      - User ObjectId or null (super admin)
 * @param {string}  opts.action      - AUDIT_ACTIONS constant
 * @param {string}  opts.entity      - AUDIT_ENTITIES constant
 * @param {*}       [opts.entityId]  - ID of the affected entity
 * @param {Object}  [opts.metadata]  - Extra context
 */
const log = async ({ req, user, action, entity, entityId, metadata = {} } = {}) => {
  try {
    await AuditLog.create({
      actor: user || null,
      action,
      entityType: entity,
      entityId: entityId || null,
      ip: req?.ip || '',
      userAgent: req?.headers?.['user-agent'] || '',
      metadata: {
        method: req?.method,
        path: req?.originalUrl,
        ...metadata,
      },
    });
  } catch (err) {
    // Audit logging failures should never affect the main flow
    console.error('[Audit] Failed to write audit log:', err.message);
  }
};

module.exports = { log };
