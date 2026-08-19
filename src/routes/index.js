const router = require('express').Router();

const buildCrudRoutes = require('./crudRoutes');

// ============================================================================
// AUTH MODULE
// ============================================================================

const authRoutes = require('../modules/auth/routes/auth.routes');

// ============================================================================
// USER MODULE
// ============================================================================

const userRoutes = require('../modules/user/routes/userRoutes');

// ============================================================================
// DEPARTMENT MODULE
// ============================================================================

const departmentRoutes = require('../modules/departments/routes/departmentRoutes');

// ============================================================================
// OTHER ROUTES
// ============================================================================

const analyticsRoutes = require('./analyticsRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const projectRoutes = require('../modules/projects/routes/projectRoutes');

// ============================================================================
// MODELS
// ============================================================================

const Task = require('../models/Task');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');

// ============================================================================
// PERMISSIONS
// ============================================================================

const { PERMISSIONS } = require('../constants/roles');

const {
  taskValidator,
} = require('../validators/moduleValidators');

// ============================================================================
// AUTH
// ============================================================================

router.use('/auth', authRoutes);

// ============================================================================
// USERS
// ============================================================================

router.use('/users', userRoutes);

// ============================================================================
// DEPARTMENTS
// Dedicated Department Management Module
// ============================================================================

router.use('/departments', departmentRoutes);

// ============================================================================
// PROJECTS
// ============================================================================

router.use('/projects', projectRoutes);

// ============================================================================
// TASKS
// ============================================================================

router.use(
  '/tasks',
  buildCrudRoutes({
    Model: Task,
    entity: 'Task',
    readPermission: PERMISSIONS.TASKS_READ,
    managePermission: PERMISSIONS.TASKS_MANAGE,
    validator: taskValidator,
  })
);

// ============================================================================
// ROLES
// ============================================================================

router.use(
  '/roles',
  buildCrudRoutes({
    Model: Role,
    entity: 'Role',
    readPermission: PERMISSIONS.ROLES_MANAGE,
    managePermission: PERMISSIONS.ROLES_MANAGE,
  })
);

// ============================================================================
// SETTINGS
// ============================================================================

router.use(
  '/settings',
  buildCrudRoutes({
    Model: Setting,
    entity: 'Setting',
    readPermission: PERMISSIONS.SETTINGS_MANAGE,
    managePermission: PERMISSIONS.SETTINGS_MANAGE,
  })
);

// ============================================================================
// AUDIT LOGS
// ============================================================================

const auditRoutes = require('../modules/audit/routes/audit.routes');
router.use('/audit-logs', auditRoutes);

// ============================================================================
// ANALYTICS
// ============================================================================

router.use('/analytics', analyticsRoutes);

// ============================================================================
// NOTIFICATIONS
// ============================================================================

router.use('/notifications', notificationRoutes);

// ============================================================================
// REPORTS
// ============================================================================

router.use('/reports', reportRoutes);

// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;