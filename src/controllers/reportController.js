const asyncHandler = require('../utils/asyncHandler');
const Task = require('../models/Task');
const Project = require('../models/Project');

const workload = asyncHandler(async (req, res) => {
  const data = await Task.aggregate([
    { $match: { deletedAt: null } },
    { $group: { _id: '$assignee', total: { $sum: 1 }, done: { $sum: { $cond: [{ $eq: ['$status', 'done'] }, 1, 0] } } } },
  ]);
  res.json({ success: true, data });
});

const projectProgress = asyncHandler(async (req, res) => {
  const data = await Project.find({ deletedAt: null }).select('name key status progress dueDate');
  res.json({ success: true, data });
});

module.exports = { workload, projectProgress };
