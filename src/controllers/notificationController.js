const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');

const list = asyncHandler(async (req, res) => {
  const data = await Notification.find({ recipient: req.user.id, deletedAt: null }).sort({ createdAt: -1 });
  res.json({ success: true, data });
});

const markRead = asyncHandler(async (req, res) => {
  const data = await Notification.findOneAndUpdate({ _id: req.params.id, recipient: req.user.id }, { readAt: new Date() }, { new: true });
  res.json({ success: true, data });
});

const markAllRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ recipient: req.user.id, readAt: null }, { readAt: new Date() });
  res.json({ success: true });
});

module.exports = { list, markRead, markAllRead };
