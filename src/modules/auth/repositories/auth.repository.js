/**
 * auth.repository.js — All DB operations for authentication.
 * No business logic, no HTTP, no JWT.
 */
'use strict';

const User = require('../../user/models/user.model');

class AuthRepository {
  /** Find user by email — includes password & refreshToken (select:false fields) */
  async findByEmail(email) {
    return User.findOne({ email: email.toLowerCase().trim() })
      .select('+password +refreshToken')
      .populate('role');
  }

  /** Find user by id, populate role & department */
  async findById(id) {
    return User.findById(id).populate('role').populate('department');
  }

  /** Find user by id, include password */
  async findByIdWithPassword(id) {
    return User.findById(id).select('+password').populate('role').populate('department');
  }

  /** Create a new user */
  async createUser(payload) {
    return User.create(payload);
  }

  /** Upsert (findOneAndUpdate with upsert) a user by email — for seeding */
  async upsertByEmail(email, data) {
    return User.findOneAndUpdate(
      { email: email.toLowerCase().trim() },
      data,
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );
  }

  /** Check if an email is already registered */
  async emailExists(email) {
    const exists = await User.exists({ email: email.toLowerCase().trim() });
    return !!exists;
  }

  /** Update the stored refresh token */
  async updateRefreshToken(userId, refreshToken) {
    await User.findByIdAndUpdate(userId, { refreshToken });
  }

  /** Clear refresh token on logout */
  async removeRefreshToken(userId) {
    await User.findByIdAndUpdate(userId, { refreshToken: null });
  }

  /** Stamp last login time */
  async updateLastLogin(userId) {
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });
  }

  /** Increment failed login counter */
  async incrementLoginAttempts(userId) {
    await User.findByIdAndUpdate(userId, { $inc: { loginAttempts: 1 } });
  }

  /** Temporarily lock the account */
  async lockAccount(userId, lockUntil) {
    await User.findByIdAndUpdate(userId, { lockUntil });
  }

  /** Reset login failure counter after successful login */
  async resetLoginAttempts(userId) {
    await User.findByIdAndUpdate(userId, { loginAttempts: 0, lockUntil: null });
  }

  /**
   * Update password (triggers pre-save hashing middleware).
   * We must use save() — findByIdAndUpdate bypasses middleware.
   */
  async updatePassword(userId, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) return null;
    user.password = newPassword;
    return user.save();
  }

  /** Find by employee code */
  async findByEmployeeCode(employeeCode) {
    return User.findOne({ employeeCode });
  }
}

module.exports = new AuthRepository();
