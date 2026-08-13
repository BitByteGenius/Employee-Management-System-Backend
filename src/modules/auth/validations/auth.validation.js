/**
 * auth.validation.js — express-validator rules for all auth endpoints.
 */
'use strict';

const { body } = require('express-validator');
const { AUTH, REGEX } = require('../../../constants');

// ─── Register ────────────────────────────────────────────────────────────────
const registerValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('First name must be 2–50 characters.'),

  body('lastName')
    .trim()
    .notEmpty().withMessage('Last name is required.')
    .isLength({ min: 2, max: 50 }).withMessage('Last name must be 2–50 characters.'),

  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required.')
    .matches(REGEX.EMAIL).withMessage('Invalid email address.'),

  body('password')
    .notEmpty().withMessage('Password is required.')
    .isLength({ min: AUTH.PASSWORD.MIN_LENGTH, max: AUTH.PASSWORD.MAX_LENGTH })
    .withMessage(`Password must be ${AUTH.PASSWORD.MIN_LENGTH}–${AUTH.PASSWORD.MAX_LENGTH} characters.`)
    .matches(AUTH.PASSWORD.REGEX)
    .withMessage('Password must contain uppercase, lowercase, a number, and a special character.'),

  body('phone')
    .optional()
    .matches(REGEX.PHONE).withMessage('Invalid phone number.'),

  body('role')
    .notEmpty().withMessage('Role is required.'),

  body('department')
    .optional({ nullable: true })
    .isMongoId().withMessage('Invalid department ID.'),

  body('designation')
    .optional()
    .trim()
    .isLength({ max: 100 }).withMessage('Designation cannot exceed 100 characters.'),
];

// ─── Login ───────────────────────────────────────────────────────────────────
const loginValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required.')
    .matches(REGEX.EMAIL).withMessage('Invalid email.'),

  body('password')
    .notEmpty().withMessage('Password is required.'),
];

// ─── Forgot Password ─────────────────────────────────────────────────────────
const forgotPasswordValidation = [
  body('email')
    .trim()
    .toLowerCase()
    .notEmpty().withMessage('Email is required.')
    .matches(REGEX.EMAIL).withMessage('Invalid email.'),
];

// ─── Reset Password ──────────────────────────────────────────────────────────
const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required.'),
  body('password')
    .notEmpty().withMessage('Password is required.')
    .matches(AUTH.PASSWORD.REGEX)
    .withMessage('Password does not meet security requirements.'),
];

// ─── Change Password ─────────────────────────────────────────────────────────
const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required.'),

  body('newPassword')
    .notEmpty().withMessage('New password is required.')
    .matches(AUTH.PASSWORD.REGEX)
    .withMessage('Password does not meet security requirements.'),

  body('confirmPassword')
    .notEmpty().withMessage('Confirm password is required.')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) throw new Error('Passwords do not match.');
      return true;
    }),
];

module.exports = {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  changePasswordValidation,
};
