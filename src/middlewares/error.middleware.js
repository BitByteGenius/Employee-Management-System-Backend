/**
 * error.middleware.js — Centralized Express error handler.
 *
 * Must be registered LAST in app.js (after all routes).
 * Catches all errors passed via next(err).
 */
'use strict';

const errorMiddleware = (error, req, res, next) => { // eslint-disable-line no-unused-vars
  const statusCode = error.statusCode || 500;

  const payload = {
    success: false,
    message: statusCode === 500 ? 'Internal server error.' : error.message,
  };

  // Validation details
  if (error.details) {
    payload.details = error.details;
  }

  // Stack trace only in development
  if (process.env.NODE_ENV !== 'production' && error.stack) {
    payload.stack = error.stack;
  }

  // Never expose secrets
  res.status(statusCode).json(payload);
};

module.exports = errorMiddleware;
