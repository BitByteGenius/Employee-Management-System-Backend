/**
 * validate.middleware.js — express-validator result checker.
 * Place after validation rule arrays in routes.
 */
'use strict';

const { validationResult } = require('express-validator');
const AppError = require('../shared/errors/app.error');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(new AppError('Validation failed.', 422, errors.array()));
  }
  return next();
};

module.exports = validate;
