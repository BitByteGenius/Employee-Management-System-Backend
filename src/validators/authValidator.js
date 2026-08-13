const { body } = require('express-validator');

const registerValidator = [
  body('name')
    .custom((value, { req }) => {
      req.body.name = req.body.name || req.body.fullName;
      if (!req.body.name || !req.body.name.trim()) {
        throw new Error('Name is required');
      }
      return true;
    }),
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
];

const loginValidator = [
  body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

module.exports = { registerValidator, loginValidator };

