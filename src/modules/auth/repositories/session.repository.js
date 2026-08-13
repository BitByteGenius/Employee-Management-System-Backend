/**
 * session.repository.js — All DB operations for Sessions.
 * No business logic, no HTTP.
 */
'use strict';

const Session = require('../models/session.model');

class SessionRepository {
  async create(payload) {
    return Session.create(payload);
  }

  /** Find by refresh token — requires explicit select because field is select:false */
  async findByRefreshToken(refreshToken) {
    return Session.findOne({ refreshToken }).select('+refreshToken');
  }

  async updateActivity(sessionId) {
    return Session.findByIdAndUpdate(sessionId, { lastActiveAt: new Date() });
  }

  async revoke(sessionId, revokedBy = null) {
    return Session.findByIdAndUpdate(sessionId, {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy,
    });
  }

  /** Revoke all active sessions for a user (logout all devices) */
  async revokeAll(userId) {
    return Session.updateMany(
      { user: userId, isRevoked: false },
      { isRevoked: true, revokedAt: new Date() },
    );
  }

  async getUserSessions(userId) {
    return Session.find({ user: userId }).sort({ lastActiveAt: -1 });
  }
}

module.exports = new SessionRepository();
