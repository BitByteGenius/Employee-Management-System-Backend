/**
 * =============================================================================
 * session.model.js — Authenticated user session (per device).
 * Module: auth
 *
 * Each login creates one session document.
 * Sessions are automatically expired via MongoDB TTL index.
 * =============================================================================
 */
'use strict';

const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const sessionSchema = new Schema(
  {
    // null for super admin sessions
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // Raw refresh token — never hash here (handled at service layer if needed)
    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    deviceId: { type: String, required: true, trim: true },
    deviceName: { type: String, default: 'Unknown Device', trim: true },
    browser: { type: String, default: '', trim: true },
    os: { type: String, default: '', trim: true },
    ipAddress: { type: String, default: '' },
    userAgent: { type: String, default: '' },
    lastActiveAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    isRevoked: { type: Boolean, default: false, index: true },
    revokedAt: { type: Date, default: null },
    revokedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Compound indexes for session lookup
sessionSchema.index({ user: 1, deviceId: 1 });
sessionSchema.index({ refreshToken: 1 });

// TTL index — MongoDB auto-deletes expired sessions
sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Exclude revoked sessions automatically from normal queries
sessionSchema.pre(/^find/, function () {
  if (this.getOptions().withRevoked) return;
  this.where({ isRevoked: false });
});

sessionSchema.methods.isExpired = function () {
  return this.expiresAt <= new Date();
};

const Session = model('Session', sessionSchema);

module.exports = Session;
