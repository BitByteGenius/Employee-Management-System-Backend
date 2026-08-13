const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const requirePermissions = require('../middlewares/permissionMiddleware');
const controller = require('../controllers/analyticsController');
const { PERMISSIONS } = require('../constants/roles');

router.get('/summary', authenticate, requirePermissions(PERMISSIONS.ANALYTICS_READ), controller.summary);

module.exports = router;
