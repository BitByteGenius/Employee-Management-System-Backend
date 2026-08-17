// const router = require('express').Router();
// const buildCrudRoutes = require('./crudRoutes');
// const authRoutes = require('./authRoutes');
// const userRoutes = require('./userRoutes');
// const analyticsRoutes = require('./analyticsRoutes');
// const notificationRoutes = require('./notificationRoutes');
// const reportRoutes = require('./reportRoutes');
// const Department = require('../models/Department');
// const Project = require('../models/Project');
// const Task = require('../models/Task');
// const Role = require('../models/Role');
// const AuditLog = require('../models/AuditLog');
// const Setting = require('../models/Setting');
// const { PERMISSIONS } = require('../constants/roles');
// const { departmentValidator, projectValidator, taskValidator } = require('../validators/moduleValidators');

// router.use('/auth', authRoutes);
// router.use('/users', userRoutes);
// router.use('/departments', buildCrudRoutes({ Model: Department, entity: 'Department', readPermission: PERMISSIONS.DEPARTMENTS_READ, managePermission: PERMISSIONS.DEPARTMENTS_MANAGE, validator: departmentValidator }));
// router.use('/projects', buildCrudRoutes({ Model: Project, entity: 'Project', readPermission: PERMISSIONS.PROJECTS_READ, managePermission: PERMISSIONS.PROJECTS_MANAGE, validator: projectValidator }));
// router.use('/tasks', buildCrudRoutes({ Model: Task, entity: 'Task', readPermission: PERMISSIONS.TASKS_READ, managePermission: PERMISSIONS.TASKS_MANAGE, validator: taskValidator }));
// router.use('/roles', buildCrudRoutes({ Model: Role, entity: 'Role', readPermission: PERMISSIONS.ROLES_MANAGE, managePermission: PERMISSIONS.ROLES_MANAGE }));
// router.use('/settings', buildCrudRoutes({ Model: Setting, entity: 'Setting', readPermission: PERMISSIONS.SETTINGS_MANAGE, managePermission: PERMISSIONS.SETTINGS_MANAGE }));
// router.use('/audit-logs', buildCrudRoutes({ Model: AuditLog, entity: 'AuditLog', readPermission: PERMISSIONS.AUDIT_READ, managePermission: PERMISSIONS.AUDIT_READ }));
// router.use('/analytics', analyticsRoutes);
// router.use('/notifications', notificationRoutes);
// router.use('/reports', reportRoutes);

// module.exports = router;



const router = require('express').Router();

const buildCrudRoutes = require('./crudRoutes');

// Auth module
const authRoutes = require('../modules/auth/routes/auth.routes');

// Existing routes
const userRoutes = require('../modules/user/routes/userRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const notificationRoutes = require('./notificationRoutes');
const reportRoutes = require('./reportRoutes');
const deliverablesRoutes = require('../modules/projects/routes/deliverablesRoutes');

// Models
const Department = require('../models/Department');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Role = require('../models/Role');
const AuditLog = require('../models/AuditLog');
const Setting = require('../models/Setting');

const { PERMISSIONS } = require('../constants/roles');

const {
    departmentValidator,
    projectValidator,
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
// ============================================================================

router.use(
    '/departments',
    buildCrudRoutes({
        Model: Department,
        entity: 'Department',
        readPermission: PERMISSIONS.DEPARTMENTS_READ,
        managePermission: PERMISSIONS.DEPARTMENTS_MANAGE,
        validator: departmentValidator,
    })
);


// ============================================================================
// PROJECTS
// ============================================================================

// router.use(
//     '/projects',
//     buildCrudRoutes({
//         Model: Project,
//         entity: 'Project',
//         readPermission: PERMISSIONS.PROJECTS_READ,
//         managePermission: PERMISSIONS.PROJECTS_MANAGE,
//         validator: projectValidator,
//     })
// );

router.use('/projects', deliverablesRoutes);


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

router.use(
    '/audit-logs',
    buildCrudRoutes({
        Model: AuditLog,
        entity: 'AuditLog',
        readPermission: PERMISSIONS.AUDIT_READ,
        managePermission: PERMISSIONS.AUDIT_READ,
    })
);


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


//===========================================================================
//Project


// ============================================================================
// EXPORT
// ============================================================================

module.exports = router;
