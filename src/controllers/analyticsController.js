const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const Department = require('../models/Department');
const Project = require('../models/Project');
const Task = require('../models/Task');

const summary = asyncHandler(async (req, res) => {
  const [users, departments, projects, tasks, pendingApprovals] = await Promise.all([
    User.countDocuments({ isDeleted: false }),
    Department.countDocuments({ deletedAt: null }),
    Project.countDocuments({ deletedAt: null }),
    Task.countDocuments({ deletedAt: null }),
    User.countDocuments({ status: 'pending', isDeleted: false }),
  ]);
  const taskStatus = await Task.aggregate([{ $match: { deletedAt: null } }, { $group: { _id: '$status', count: { $sum: 1 } } }]);
  res.json({ success: true, data: { users, departments, projects, tasks, pendingApprovals, taskStatus } });
});

module.exports = { summary };
