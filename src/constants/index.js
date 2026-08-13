/**
 * Centralized constants barrel.
 * Import everything from here to avoid scattered require paths.
 */

const { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } = require('./roles');

// ─── HTTP Status Codes ────────────────────────────────────────────────────────

const HTTP_STATUS = Object.freeze({
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
});

// ─── Auth Constants ───────────────────────────────────────────────────────────

const AUTH = Object.freeze({
  PASSWORD: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 64,
    REGEX: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
  },
  LOGIN: {
    MAX_ATTEMPTS: 5,
    LOCK_TIME: 30 * 60 * 1000, // 30 minutes
  },
});

// ─── Common RegEx ─────────────────────────────────────────────────────────────

const REGEX = Object.freeze({
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\+?[\d\s\-()]{7,15}$/,
});

module.exports = {
  ROLES,
  PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  HTTP_STATUS,
  AUTH,
  REGEX,
};
