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

    // System account type (EMPLOYEE, ADMIN, SUPER_ADMIN)
    systemRole: {
      type: String,
      enum: ['EMPLOYEE', 'ADMIN', 'SUPER_ADMIN'],
      default: 'EMPLOYEE',
      required: true,
      index: true,
      uppercase: true,
    },

    // Reference to assigned granular Role document (for Employees)
    assignedRole: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
      index: true,
    },

    // Deprecated legacy field preserved for migration compatibility
    role: {
      type: Schema.Types.ObjectId,
      ref: 'Role',
      default: null,
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

userSchema.methods.toSafeObject = function () {
  const sysRole = this.systemRole || (
    typeof this.role === 'object' && this.role !== null && this.role.name
      ? (this.role.name.toUpperCase().includes('SUPER') ? 'SUPER_ADMIN' : (this.role.name.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'EMPLOYEE'))
      : 'EMPLOYEE'
  );

  const assignedRoleObj = this.assignedRole;
  const assignedRoleId = (typeof assignedRoleObj === 'object' && assignedRoleObj !== null && assignedRoleObj._id)
    ? assignedRoleObj._id.toString()
    : (this.assignedRole ? this.assignedRole.toString() : null);
  const assignedRoleLabel = (typeof assignedRoleObj === 'object' && assignedRoleObj !== null)
    ? (assignedRoleObj.label || assignedRoleObj.name || null)
    : null;

  const roleObj = this.role;
  const permissions = (typeof assignedRoleObj === 'object' && assignedRoleObj !== null && assignedRoleObj.permissions)
    ? assignedRoleObj.permissions
    : ((typeof roleObj === 'object' && roleObj !== null && roleObj.permissions) ? roleObj.permissions : []);

  const deptObj = this.department;
  const departmentId = (typeof deptObj === 'object' && deptObj !== null && deptObj._id)
    ? deptObj._id.toString()
    : (this.department ? this.department.toString() : null);
  const departmentName = (typeof deptObj === 'object' && deptObj !== null)
    ? (deptObj.name || deptObj.code || null)
    : null;

  return {
    id: this._id.toString(),
    _id: this._id.toString(),
    employeeCode: this.employeeCode,
    name: this.fullName || `${this.firstName || ''} ${this.lastName || ''}`.trim(),
    fullName: this.fullName || `${this.firstName || ''} ${this.lastName || ''}`.trim(),
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    phone: this.phone,

    systemRole: sysRole,
    role: sysRole, // string for UI & backward compatibility

    assignedRole: typeof assignedRoleObj === 'object' ? assignedRoleObj : null,
    assignedRoleId,
    assignedRoleLabel,

    permissions,

    department: typeof deptObj === 'object' ? deptObj : null,
    departmentId,
    departmentName,

    designation: this.designation,
    profilePicture: this.profilePicture,
    isActive: this.isActive,
    isApproved: this.isApproved,
    status: this.status,
    accountStatus: this.status, // alias for Flutter compatibility
    lastLogin: this.lastLogin,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

const User = model('User', userSchema);

module.exports = User;
