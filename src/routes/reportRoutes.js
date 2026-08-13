const router = require('express').Router();
const authenticate = require('../middlewares/auth');
const requirePermissions = require('../middlewares/permissionMiddleware');
const controller = require('../controllers/reportController');
const { PERMISSIONS } = require('../constants/roles');

router.use(authenticate, requirePermissions(PERMISSIONS.REPORTS_READ));
router.get('/workload', controller.workload);
router.get('/project-progress', controller.projectProgress);

module.exports = router;
