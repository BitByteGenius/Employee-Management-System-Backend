const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed, default: null },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, strict: false },
);

module.exports = mongoose.models.Setting || mongoose.model('Setting', settingSchema);
