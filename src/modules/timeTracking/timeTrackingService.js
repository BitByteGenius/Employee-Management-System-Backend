const mongoose = require('mongoose');
const TimeLog = require('../../models/TimeLog');
const User = require('../user/models/user.model');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

class TimeTrackingService {
  /**
   * Get list of time logs with department metrics
   */
  async getTimeLogs({
    page = 1,
    limit = 50,
    department = '',
    user = '',
    status = '',
    startDate = null,
    endDate = null,
  }) {
    page = Math.max(Number(page) || 1, 1);
    limit = Math.min(Math.max(Number(limit) || 50, 1), 100);
    const skip = (page - 1) * limit;

    const filter = { isDeleted: false };

    if (department && isValidObjectId(department)) {
      filter.department = department;
    }
    if (user && isValidObjectId(user)) {
      filter.user = user;
    }
    if (status && status !== 'all') {
      filter.status = status.toLowerCase();
    }
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const [logs, total, statsResult] = await Promise.all([
      TimeLog.find(filter)
        .populate({
          path: 'user',
          select: 'firstName lastName fullName email profilePicture designation assignedRole',
          populate: { path: 'assignedRole', select: 'name label' },
        })
        .populate('department', 'name code')
        .populate('project', 'name key')
        .populate('task', 'title')
        .sort({ date: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

      TimeLog.countDocuments(filter),

      // Calculate KPI statistics from database
      TimeLog.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalHours: { $sum: '$hours' },
            uniqueUsers: { $addToSet: '$user' },
          },
        },
      ]),
    ]);

    // Calculate today's logged hours
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayFilter = { ...filter, date: { $gte: startOfToday } };
    const todayStats = await TimeLog.aggregate([
      { $match: todayFilter },
      { $group: { _id: null, totalHours: { $sum: '$hours' } } },
    ]);

    const totalHours = statsResult[0]?.totalHours || 0;
    const uniqueUserCount = statsResult[0]?.uniqueUsers?.length || 1;
    const todayHours = todayStats[0]?.totalHours || 0;
    const avgPerMember = totalHours > 0 ? (totalHours / uniqueUserCount).toFixed(1) : '0.0';

    const formattedLogs = logs.map((log) => {
      const u = log.user;
      const userName = u
        ? (u.fullName || `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email)
        : 'Team Member';
      const userRole = u?.designation || u?.assignedRole?.label || u?.assignedRole?.name || 'Member';

      return {
        id: log._id.toString(),
        name: userName,
        role: userRole,
        task: log.taskName || log.task?.title || 'General Activity',
        hours: `${log.hours.toFixed(1)} hrs`,
        rawHours: log.hours,
        status: (log.status || 'approved').charAt(0).toUpperCase() + (log.status || 'approved').slice(1),
        date: log.date ? new Date(log.date).toISOString().split('T')[0] : 'Today',
        notes: log.notes,
      };
    });

    return {
      data: formattedLogs,
      metrics: {
        loggedToday: `${todayHours.toFixed(1)} hrs`,
        weeklyTotal: `${totalHours.toFixed(1)} hrs`,
        activeTimers: uniqueUserCount.toString(),
        averagePerMember: `${avgPerMember} hrs`,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  /**
   * Log time entry in MongoDB
   */
  async createTimeLog(data, currentUserId) {
    const validUserId = isValidObjectId(data.user) ? data.user : currentUserId;
    const taskName = (data.taskName || data.task || 'General Activity').trim();
    const hours = Number(data.hours) || 1;

    const log = await TimeLog.create({
      user: validUserId,
      department: (data.department && isValidObjectId(data.department)) ? data.department : null,
      project: (data.project && isValidObjectId(data.project)) ? data.project : null,
      task: (data.task && isValidObjectId(data.task)) ? data.task : null,
      taskName,
      hours,
      date: data.date ? new Date(data.date) : new Date(),
      status: data.status || 'approved',
      notes: data.notes || '',
    });

    return log;
  }
}

module.exports = new TimeTrackingService();
