const taskService = require('./taskService');

const getUserId = (req) => req.user?._id || req.user?.id;

const getTasks = async (req, res, next) => {
  try {
    let department = req.query.department;

    // Strict Department Scoping: If user is a Department Admin, auto-scope to their department
    if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
      const userDept = req.user.department?._id || req.user.department || req.user.departmentId;
      if (userDept) {
        department = userDept.toString();
      }
    }

    const result = await taskService.getTasks({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
      priority: req.query.priority,
      project: req.query.project,
      assignee: req.query.assignee,
      department,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const task = await taskService.getTaskById(req.params.id);
    return res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const createTask = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Auto-bind department if creator is a Department Admin
    if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
      const userDept = req.user.department?._id || req.user.department || req.user.departmentId;
      if (userDept && !data.department) {
        data.department = userDept.toString();
      }
    }

    const task = await taskService.createTask(
      data,
      getUserId(req),
      req.file,
    );

    return res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id,
      req.body,
      getUserId(req),
    );

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const task = await taskService.updateStatus(
      req.params.id,
      req.body.status,
      getUserId(req),
    );

    return res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(
      req.params.id,
      getUserId(req),
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
};
