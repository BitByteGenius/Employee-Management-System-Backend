const ROLES = Object.freeze({
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
});

const PERMISSIONS = Object.freeze({
  USERS_READ: 'users:read',
  USERS_MANAGE: 'users:manage',
  ROLES_MANAGE: 'roles:manage',
  DEPARTMENTS_READ: 'departments:read',
  DEPARTMENTS_MANAGE: 'departments:manage',
  PROJECTS_READ: 'projects:read',
  PROJECTS_MANAGE: 'projects:manage',
  TASKS_READ: 'tasks:read',
  TASKS_MANAGE: 'tasks:manage',
  TASKS_APPROVE: 'tasks:approve',
  REPORTS_READ: 'reports:read',
  ANALYTICS_READ: 'analytics:read',
  AUDIT_READ: 'audit:read',
  SETTINGS_MANAGE: 'settings:manage',
  NOTIFICATIONS_READ: 'notifications:read',
});

const DEFAULT_ROLE_PERMISSIONS = Object.freeze({
  [ROLES.SUPER_ADMIN]: Object.values(PERMISSIONS),
  [ROLES.ADMIN]: [
    PERMISSIONS.USERS_READ,
    PERMISSIONS.DEPARTMENTS_READ,
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.PROJECTS_MANAGE,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.TASKS_MANAGE,
    PERMISSIONS.TASKS_APPROVE,
    PERMISSIONS.REPORTS_READ,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
  [ROLES.EMPLOYEE]: [
    PERMISSIONS.PROJECTS_READ,
    PERMISSIONS.TASKS_READ,
    PERMISSIONS.NOTIFICATIONS_READ,
  ],
});

module.exports = { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS };
