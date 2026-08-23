const departmentService = require('../services/departmentService');

const getUserId = (req) =>
  req.user?._id || req.user?.id;

const createDepartment = async (req, res, next) => {
  try {
    const department =
      await departmentService.createDepartment(
        req.body,
        getUserId(req),
      );

    return res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartments = async (req, res, next) => {
  try {
    const result =
      await departmentService.getDepartments({
        page: req.query.page,
        limit: req.query.limit,
        search: req.query.search,
        status: req.query.status,
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

const getDepartment = async (req, res, next) => {
  try {
    const department =
      await departmentService.getDepartmentById(
        req.params.id,
      );

    return res.status(200).json({
      success: true,
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const department =
      await departmentService.updateDepartment(
        req.params.id,
        req.body,
        getUserId(req),
      );

    return res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const assignAdmin = async (req, res, next) => {
  try {
    const { adminId } = req.body;

    if (!adminId) {
      return res.status(400).json({
        success: false,
        message: 'adminId is required',
      });
    }

    const department =
      await departmentService.assignAdmin(
        req.params.id,
        adminId,
        getUserId(req),
      );

    return res.status(200).json({
      success: true,
      message: 'Department admin assigned successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const removeAdmin = async (req, res, next) => {
  try {
    const department =
      await departmentService.removeAdmin(
        req.params.id,
        getUserId(req),
      );

    return res.status(200).json({
      success: true,
      message: 'Department admin removed successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentEmployees = async (
  req,
  res,
  next,
) => {
  try {
    const result =
      await departmentService.getDepartmentEmployees(
        req.params.id,
        {
          page: req.query.page,
          limit: req.query.limit,
          search: req.query.search,
        },
      );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartmentStatus = async (
  req,
  res,
  next,
) => {
  try {
    const department =
      await departmentService.updateStatus(
        req.params.id,
        req.body.status,
        getUserId(req),
      );

    return res.status(200).json({
      success: true,
      message: 'Department status updated successfully',
      data: department,
    });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (
  req,
  res,
  next,
) => {
  try {
    const result =
      await departmentService.deleteDepartment(
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

const getDepartmentSettings = async (req, res, next) => {
  try {
    const settings = await departmentService.getSettings(req.params.id);
    return res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const updateDepartmentSettings = async (req, res, next) => {
  try {
    const settings = await departmentService.updateSettings(
      req.params.id,
      req.body,
      getUserId(req),
    );
    return res.status(200).json({
      success: true,
      message: 'Department settings updated',
      data: settings,
    });
  } catch (error) {
    next(error);
  }
};

const getDepartmentReports = async (req, res, next) => {
  try {
    const reports = await departmentService.getReports(req.params.id);
    return res.status(200).json({
      success: true,
      data: reports,
    });
  } catch (error) {
    next(error);
  }
};

const getAdminCandidates = async (req, res, next) => {
  try {
    const candidates = await departmentService.getAdminCandidates(
      req.query.search,
    );
    return res.status(200).json({
      success: true,
      data: candidates,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  assignAdmin,
  removeAdmin,
  getDepartmentEmployees,
  updateDepartmentStatus,
  deleteDepartment,
  getDepartmentSettings,
  updateDepartmentSettings,
  getDepartmentReports,
  getAdminCandidates,
};
