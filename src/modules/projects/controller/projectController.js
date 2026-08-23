const projectService = require('../services/projectService');

const getUserId = (req) =>
  req.user?._id || req.user?.id;

const getProjects = async (req, res, next) => {
  try {
    let department = req.query.department;

    // Strict Department Scoping: If user is a Department Admin, only fetch their department's projects
    if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
      const userDept = req.user.department?._id || req.user.department || req.user.departmentId;
      if (userDept) {
        department = userDept.toString();
      }
    }

    const result = await projectService.getProjects({
      page: req.query.page,
      limit: req.query.limit,
      search: req.query.search,
      status: req.query.status,
      manager: req.query.manager,
      department: department,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
    });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);

    return res.status(200).json({
      success: true,
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const createProject = async (req, res, next) => {
  try {
    const data = { ...req.body };

    // Auto-bind department to Department Admin's department
    if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
      const userDept = req.user.department?._id || req.user.department || req.user.departmentId;
      if (userDept) {
        data.department = userDept.toString();
      }
    }

    const project = await projectService.createProject(
      data,
      getUserId(req),
      req.file,
    );

    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateProject = async (req, res, next) => {
  try {
    const project = await projectService.updateProject(
      req.params.id,
      req.body,
      getUserId(req),
    );

    return res.status(200).json({
      success: true,
      message: 'Project updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const updateProjectStatus = async (req, res, next) => {
  try {
    const project = await projectService.updateStatus(
      req.params.id,
      req.body.status,
      getUserId(req),
    );

    return res.status(200).json({
      success: true,
      message: 'Project status updated successfully',
      data: project,
    });
  } catch (error) {
    next(error);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(
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
  getProjects,
  getProject,
  createProject,
  updateProject,
  updateProjectStatus,
  deleteProject,
};
