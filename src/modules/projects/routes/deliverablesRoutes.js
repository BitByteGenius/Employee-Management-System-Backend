const router = require('express').Router();
const uploadDeliverable = require('../../../middlewares/uploadMiddleware');
const { deliverableValidator } = require('../../../validators/moduleValidators');
const authMiddleware = require('../../../middlewares/auth.middleware');
const { submitDeliverables } = require('../controller/deliverableController');

router.post(
  '/:id/deliverables',
  authMiddleware,
  uploadDeliverable.single('file'),
  deliverableValidator,
  submitDeliverables,
);

module.exports = router;