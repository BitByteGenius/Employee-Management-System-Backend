'use strict';

const router = require('express').Router();
const auditController = require('../controllers/audit.controller');
const authenticate = require('../../../middlewares/auth');
const requirePermissions = require('../../../middlewares/permissionMiddleware');
const { PERMISSIONS } = require('../../../constants/roles');

router.use(authenticate);
router.get('/', requirePermissions(PERMISSIONS.AUDIT_READ), auditController.list);

module.exports = router;
