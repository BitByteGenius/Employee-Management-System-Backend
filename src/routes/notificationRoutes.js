const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const requirePermissions = require('../middlewares/permissionMiddleware');
const controller = require('../controllers/notificationController');
const { PERMISSIONS } = require('../constants/roles');

router.use(authenticate, requirePermissions(PERMISSIONS.NOTIFICATIONS_READ));
router.get('/', controller.list);
router.patch('/read-all', controller.markAllRead);
router.patch('/:id/read', controller.markRead);

module.exports = router;
