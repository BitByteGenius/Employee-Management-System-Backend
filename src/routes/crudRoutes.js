const router = require('express').Router;
const createCrudController = require('../controllers/crudControllerFactory');
const authenticate = require('../middlewares/auth');
const requirePermissions = require('../middlewares/permissionMiddleware');
const validate = require('../middlewares/validate');
const auditLogger = require('../middlewares/auditLogger');

const buildCrudRoutes = ({ Model, entity, readPermission, managePermission, validator = [] }) => {
  const route = router();
  const controller = createCrudController(Model);
  route.use(authenticate);
  route.get('/', requirePermissions(readPermission), controller.list);
  route.get('/:id', requirePermissions(readPermission), controller.get);
  route.post('/', requirePermissions(managePermission), validator, validate, auditLogger(`${entity}.create`, entity, (req) => req.body._id), controller.create);
  route.put('/:id', requirePermissions(managePermission), auditLogger(`${entity}.update`, entity), controller.update);
  route.delete('/:id', requirePermissions(managePermission), auditLogger(`${entity}.delete`, entity), controller.remove);
  return route;
};

module.exports = buildCrudRoutes;
