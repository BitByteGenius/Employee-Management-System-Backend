/**
 * auth.routes.js — Authentication route definitions.
 *
 * POST /auth/register
 * POST /auth/login
 * POST /auth/refresh-token
 * POST /auth/logout
 * GET  /auth/me
 * POST /auth/forgot-password
 * POST /auth/reset-password
 * POST /auth/change-password
 */
'use strict';

const router = require('express').Router();
const controller = require('../controllers/auth.controller');
const authenticate = require('../../../middlewares/auth.middleware');
const validate = require('../../../middlewares/validate.middleware');
const {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
} = require('../validations/auth.validation');

// Public routes
router.post('/register', registerValidation, validate, controller.register);
router.post('/login', loginValidation, validate, controller.login);
router.post('/google', controller.googleAuth);
router.post('/refresh-token', controller.refreshToken);
router.post('/forgot-password', forgotPasswordValidation, validate, controller.forgotPassword);
router.post('/reset-password', resetPasswordValidation, validate, controller.resetPassword);

// Protected routes (require valid JWT)
router.post('/logout', authenticate, controller.logout);
router.get('/me', authenticate, controller.me);
router.post('/change-password', authenticate, changePasswordValidation, validate, controller.changePassword);

module.exports = router;
