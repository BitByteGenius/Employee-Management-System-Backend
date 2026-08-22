const timeTrackingService = require('./timeTrackingService');

const getUserId = (req) => req.user?._id || req.user?.id;

const getTimeLogs = async (req, res, next) => {
  try {
    let department = req.query.department;

    if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
      const userDept = req.user.department?._id || req.user.department || req.user.departmentId;
      if (userDept) {
        department = userDept.toString();
      }
    }

    const result = await timeTrackingService.getTimeLogs({
      page: req.query.page,
      limit: req.query.limit,
      department,
      user: req.query.user,
      status: req.query.status,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const createTimeLog = async (req, res, next) => {
  try {
    const data = { ...req.body };
    if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
      const userDept = req.user.department?._id || req.user.department || req.user.departmentId;
      if (userDept && !data.department) {
        data.department = userDept.toString();
      }
    }

    const log = await timeTrackingService.createTimeLog(data, getUserId(req));

    return res.status(201).json({
      success: true,
      message: 'Time entry logged successfully',
      data: log,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTimeLogs,
  createTimeLog,
};
