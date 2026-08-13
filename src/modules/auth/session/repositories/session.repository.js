import Session from "../models/session.model.js";

class SessionRepository {
  async create(payload) {
    return Session.create(payload);
  }

  async findByRefreshToken(refreshToken) {
    return Session.findOne({
      refreshToken,
    }).select("+refreshToken");
  }

  async updateActivity(sessionId) {
    return Session.findByIdAndUpdate(sessionId, {
      lastActiveAt: new Date(),
    });
  }

  async revoke(sessionId, revokedBy = null) {
    return Session.findByIdAndUpdate(sessionId, {
      isRevoked: true,
      revokedAt: new Date(),
      revokedBy,
    });
  }

  async revokeAll(userId) {
    return Session.updateMany(
      {
        user: userId,
      },
      {
        isRevoked: true,
        revokedAt: new Date(),
      }
    );
  }

  async getUserSessions(userId) {
    return Session.find({
      user: userId,
    }).sort({
      lastActiveAt: -1,
    });
  }
}

export default new SessionRepository();