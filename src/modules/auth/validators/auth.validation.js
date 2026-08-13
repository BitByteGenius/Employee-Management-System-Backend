/**
 * =============================================================================
 * File: auth.validation.js
 * Module: Authentication
 *
 * Description:
 * -----------------------------------------------------------------------------
 * Validation rules for authentication endpoints.
 *
 * Responsibilities:
 * -----------------------------------------------------------------------------
 * - Register validation
 * - Login validation
 * - Change password validation
 * - Forgot password validation
 * - Reset password validation
 *
 * =============================================================================
 */

import { body } from "express-validator";

import { AUTH, REGEX } from "../../../constants/index.js";

/**
 * ---------------------------------------------------------------------------
 * Register Validation
 * ---------------------------------------------------------------------------
 */
export const registerValidation = [

    body("firstName")
        .trim()
        .notEmpty()
        .withMessage("First name is required.")
        .isLength({ min: 2, max: 50 })
        .withMessage("First name must be between 2 and 50 characters."),

    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required.")
        .isLength({ min: 2, max: 50 })
        .withMessage("Last name must be between 2 and 50 characters."),

    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required.")
        .matches(REGEX.EMAIL)
        .withMessage("Invalid email address."),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .isLength({
            min: AUTH.PASSWORD.MIN_LENGTH,
            max: AUTH.PASSWORD.MAX_LENGTH
        })
        .withMessage(
            `Password must be between ${AUTH.PASSWORD.MIN_LENGTH} and ${AUTH.PASSWORD.MAX_LENGTH} characters.`
        )
        .matches(AUTH.PASSWORD.REGEX)
        .withMessage(
            "Password must contain uppercase, lowercase, number and special character."
        ),

    body("phone")
        .optional()
        .matches(REGEX.PHONE)
        .withMessage("Invalid phone number."),

    body("role")
        .notEmpty()
        .withMessage("Role is required."),

    body("department")
        .optional({ nullable: true })
        .isMongoId()
        .withMessage("Invalid department id."),

    body("designation")
        .optional()
        .trim()
        .isLength({ max: 100 })
        .withMessage("Designation cannot exceed 100 characters.")
];

/**
 * ---------------------------------------------------------------------------
 * Login Validation
 * ---------------------------------------------------------------------------
 */

export const loginValidation = [

    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required.")
        .matches(REGEX.EMAIL)
        .withMessage("Invalid email."),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
];

/**
 * ---------------------------------------------------------------------------
 * Forgot Password Validation
 * ---------------------------------------------------------------------------
 */

export const forgotPasswordValidation = [

    body("email")
        .trim()
        .toLowerCase()
        .notEmpty()
        .withMessage("Email is required.")
        .matches(REGEX.EMAIL)
        .withMessage("Invalid email.")
];

/**
 * ---------------------------------------------------------------------------
 * Reset Password Validation
 * ---------------------------------------------------------------------------
 */

export const resetPasswordValidation = [

    body("token")
        .notEmpty()
        .withMessage("Reset token is required."),

    body("password")
        .notEmpty()
        .withMessage("Password is required.")
        .matches(AUTH.PASSWORD.REGEX)
        .withMessage("Password does not meet security requirements.")
];

/**
 * ---------------------------------------------------------------------------
 * Change Password Validation
 * ---------------------------------------------------------------------------
 */

export const changePasswordValidation = [

    body("currentPassword")
        .notEmpty()
        .withMessage("Current password is required."),

    body("newPassword")
        .notEmpty()
        .withMessage("New password is required.")
        .matches(AUTH.PASSWORD.REGEX)
        .withMessage("Password does not meet security requirements."),

    body("confirmPassword")
        .notEmpty()
        .withMessage("Confirm password is required.")
        .custom((value, { req }) => {

            if (value !== req.body.newPassword) {
                throw new Error("Passwords do not match.");
            }

            return true;

        })
];