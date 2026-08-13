const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    scope: { type: String, enum: ['global', 'department', 'user'], default: 'global' },
    owner: mongoose.Schema.Types.ObjectId,
  },
  { timestamps: true },
);

module.exports = mongoose.model('Setting', settingSchema);
