/**
 * =============================================================================
 * user.model.js — Single source of truth for the User document.
 * Module: auth
 *
 * Schema strategy:
 *   • firstName + lastName → auto-computed fullName
 *   • role → ObjectId ref to Role (for granular permissions)
 *   • status/isApproved/isActive → approval workflow
 *   • password/refreshToken → select:false (never leaked)
 * =============================================================================
 */
'use strict';

const mongoose = require('mongoose');
const { hashPassword, comparePassword } = require('../../../shared/utils/password.util');

const { Schema, model } = mongoose;

const userSchema = new Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },

    firstName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },

    fullName: { type: String, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    phone: { type: String, default: null },

    password: {
      type: String,
      required: true,
      select: false,
    },

    profilePicture: { type: String, default: null },

    // Reference to the Role document
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      required: true,
      index: true,
    },

    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
      default: null,
    },

    designation: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true },
    dateOfBirth: { type: Date, default: null },
    bio: { type: String, default: '', trim: true },
    emergencyContact: { type: String, default: '', trim: true },

    // Account status
    isActive: { type: Boolean, default: false, index: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    isApproved: { type: Boolean, default: false },
    isEmailVerified: { type: Boolean, default: false },

    // Login tracking
    lastLogin: { type: Date, default: null },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },

    // Auth tokens (never returned in queries by default)
    refreshToken: { type: String, select: false, default: null },

    // Soft delete
    isDeleted: { type: Boolean, default: false, index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform(doc, ret) {
        // Never expose sensitive fields in JSON output
        delete ret.password;
        delete ret.refreshToken;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        return ret;
      },
    },
    toObject: { virtuals: true },
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
userSchema.index({ department: 1 });

// ─── Soft-delete Query Filter ────────────────────────────────────────────────
userSchema.pre(/^find/, function () {
  if (this.getOptions().withDeleted) return;
  this.where({ isDeleted: false });
});

userSchema.query.withDeleted = function () {
  return this.setOptions({ withDeleted: true });
};

// ─── Pre-save Hooks ───────────────────────────────────────────────────────────
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await hashPassword(this.password);
  }
});

userSchema.pre('save', function () {
  if (this.firstName || this.lastName) {
    this.fullName = `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
});

// ─── Instance Methods ─────────────────────────────────────────────────────────
userSchema.methods.comparePassword = async function (password) {
  return comparePassword(password, this.password);
};

userSchema.methods.isLocked = function () {
  if (!this.lockUntil) return false;
  return this.lockUntil > Date.now();
};

/**
 * Build a Flutter-compatible safe user object.
 * Always returns a flat object with string role and permissions array.
 */
userSchema.methods.toSafeObject = function () {
  const roleObj = this.role;
  const roleName = typeof roleObj === 'object' && roleObj !== null
    ? (roleObj.name || 'employee')
    : String(roleObj || 'employee');
  const permissions = (typeof roleObj === 'object' && roleObj !== null)
    ? (roleObj.permissions || [])
    : [];

  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    employeeCode: this.employeeCode,
    name: this.fullName || `${this.firstName} ${this.lastName}`,
    fullName: this.fullName || `${this.firstName} ${this.lastName}`,
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,
    role: roleName,
    permissions,
    department: this.department,
    designation: this.designation,
    profilePicture: this.profilePicture,
    isActive: this.isActive,
    isApproved: this.isApproved,
    status: this.status,
    accountStatus: this.status, // alias for Flutter compatibility
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
  };
};

const User = model('User', userSchema);

module.exports = User;
