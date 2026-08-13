/**
 * =============================================================================
 * File: session.model.js
 * Module: Session
 *
 * Description
 * -----------------------------------------------------------------------------
 * Stores authenticated user sessions.
 *
 * Why?
 * -----------------------------------------------------------------------------
 * A user may login from multiple devices.
 *
 * Every login creates one session.
 *
 * Examples:
 *
 * Rahul
 * ├── Windows Chrome
 * ├── Android App
 * ├── MacBook Safari
 * └── iPad
 *
 * Each session has its own refresh token.
 *
 * =============================================================================
 */

import mongoose from "mongoose";

const { Schema, model } = mongoose;

const sessionSchema = new Schema(
  {
    /**
     * Session Owner
     */
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /**
     * Hashed Refresh Token
     *
     * IMPORTANT:
     * Never store refresh tokens in plain text.
     */
    refreshToken: {
      type: String,
      required: true,
      select: false,
    },

    /**
     * Unique Device Identifier
     */
    deviceId: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Device Name
     */
    deviceName: {
      type: String,
      default: "Unknown Device",
      trim: true,
    },

    /**
     * Browser
     */
    browser: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * Operating System
     */
    os: {
      type: String,
      default: "",
      trim: true,
    },

    /**
     * IP Address
     */
    ipAddress: {
      type: String,
      default: "",
    },

    /**
     * User Agent
     */
    userAgent: {
      type: String,
      default: "",
    },

    /**
     * Last Activity
     */
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },

    /**
     * Expiration
     */
    expiresAt: {
      type: Date,
      required: true,
    },

    /**
     * Session Revoked
     */
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },

    /**
     * Revocation Time
     */
    revokedAt: {
      type: Date,
      default: null,
    },

    /**
     * Revoked By
     */
    revokedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/**
 * ============================================================================
 * Indexes
 * ============================================================================
 */

sessionSchema.index({
  user: 1,
  deviceId: 1,
});



sessionSchema.index({
  refreshToken: 1,
});

/**
 * ============================================================================
 * TTL Index
 * ============================================================================
 *
 * MongoDB automatically deletes
 * expired sessions.
 */

sessionSchema.index(
  {
    expiresAt: 1,
  },
  {
    expireAfterSeconds: 0,
  }
);

/**
 * ============================================================================
 * Query Middleware
 * ============================================================================
 */

sessionSchema.pre(/^find/, function () {
  this.where({
    isRevoked: false,
  });
});

/**
 * ============================================================================
 * Instance Method
 * ============================================================================
 */

sessionSchema.methods.isExpired = function () {
  return this.expiresAt <= new Date();
};

const Session = model("Session", sessionSchema);

export default Session;