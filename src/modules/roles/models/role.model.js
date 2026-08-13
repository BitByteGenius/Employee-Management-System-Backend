/**
 * =============================================================================
 * role.model.js — Role document for RBAC.
 * Module: auth
 * =============================================================================
 */
'use strict';

const mongoose = require('mongoose');

const { Schema, model } = mongoose;

const roleSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Role name is required'],
      trim: true,
      unique: true,
      minlength: 2,
      maxlength: 50,
    },

    // Human-readable label (e.g. "Super Admin")
    label: {
      type: String,
      trim: true,
      default: '',
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    // Array of permission strings e.g. ["users:read", "projects:manage"]
    permissions: {
      type: [String],
      default: [],
    },

    // System roles cannot be accidentally deleted
    isSystem: { type: Boolean, default: false },

    isDeleted: { type: Boolean, default: false, index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Exclude soft-deleted roles automatically
roleSchema.pre(/^find/, function () {
  if (this.getOptions().withDeleted) return;
  this.where({ isDeleted: false });
});

roleSchema.query.withDeleted = function () {
  return this.setOptions({ withDeleted: true });
};

roleSchema.methods.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

roleSchema.statics.getSystemRoles = function () {
  return this.find({ isSystem: true });
};

const Role = model('Role', roleSchema);

module.exports = Role;
