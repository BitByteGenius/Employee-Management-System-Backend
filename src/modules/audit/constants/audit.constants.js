/**
 * Audit action and entity constants.
 * Use these everywhere instead of raw strings.
 */

const AUDIT_ACTIONS = Object.freeze({
  LOGIN: 'auth.login',
  LOGOUT: 'auth.logout',
  REGISTER: 'auth.register',
  PASSWORD_CHANGE: 'auth.password_change',
  PASSWORD_RESET: 'auth.password_reset',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  APPROVE: 'user.approve',
  REJECT: 'user.reject',
  ACTIVATE: 'user.activate',
  DEACTIVATE: 'user.deactivate',
});

const AUDIT_ENTITIES = Object.freeze({
  AUTH: 'Auth',
  USER: 'User',
  ROLE: 'Role',
  DEPARTMENT: 'Department',
  PROJECT: 'Project',
  TASK: 'Task',
  SETTING: 'Setting',
  NOTIFICATION: 'Notification',
  AUDIT_LOG: 'AuditLog',
});

module.exports = { AUDIT_ACTIONS, AUDIT_ENTITIES };
