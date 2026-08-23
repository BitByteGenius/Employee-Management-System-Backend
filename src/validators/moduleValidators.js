const { body, param } = require('express-validator');

const idParam = [param('id').isMongoId()];

const departmentValidator = [
  body('name').trim().notEmpty(),
  body('code').trim().notEmpty().isLength({ min: 2, max: 8 }),
];

const projectValidator = [
  body('name').trim().notEmpty(),
  body('key').trim().notEmpty().isLength({ min: 2, max: 12 }),
  body('department').isMongoId(),
  body('owner').isMongoId(),
];

const taskValidator = [
  body('title').trim().notEmpty(),
  body('project').isMongoId(),
  body('reporter').optional().isMongoId(),
  body('assignee').optional().isMongoId(),
];

// Added deliverable validator
const deliverableValidator = [
  body('externalLink').optional().isURL().withMessage('Invalid URL format for external link'),
  body('selectedDate').optional().isISO8601().toDate().withMessage('Invalid deadline date format'),
  body('notes').optional().trim().isString(),
];

module.exports = { 
  idParam, 
  departmentValidator, 
  projectValidator, 
  taskValidator, 
  deliverableValidator 
};