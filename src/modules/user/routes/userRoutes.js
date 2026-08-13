const router = require('express').Router();
const controller = require('../controller/userController');
const authenticate = require('../../../middlewares/auth');
const requirePermissions = require('../../../middlewares/permissionMiddleware');
const auditLogger = require('../../../middlewares/auditLogger');
const { PERMISSIONS } = require('../../../constants/roles');

router.use(authenticate);
router.get('/', requirePermissions(PERMISSIONS.USERS_READ), controller.list);
router.patch('/:id/approve', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.approve', 'User'), controller.approve);
router.patch('/:id/reject', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.reject', 'User'), controller.reject);
router.patch('/:id/activate', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.activate', 'User'), controller.activate);
router.patch('/:id/deactivate', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.deactivate', 'User'), controller.deactivate);
router.patch('/:id/role', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.update_role', 'User'), controller.updateRole);
router.patch('/:id/department', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.assign_department', 'User'), controller.assignDepartment);
router.patch('/:id/assign-role', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.assign_role', 'User'), controller.assignRole);
router.delete('/:id', requirePermissions(PERMISSIONS.USERS_MANAGE), auditLogger('user.delete', 'User'), controller.remove);

module.exports = router;
