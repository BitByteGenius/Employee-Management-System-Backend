const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    code: {
      type: String,
      required: [true, 'Department code is required'],
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 20,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },

    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

// Department code must be unique among non-deleted departments.
departmentSchema.index(
  { code: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
    },
  },
);

departmentSchema.index({
  name: 'text',
  code: 'text',
});

departmentSchema.index({
  admin: 1,
  status: 1,
  isDeleted: 1,
});

module.exports = mongoose.models.Department || mongoose.model('Department', departmentSchema);
