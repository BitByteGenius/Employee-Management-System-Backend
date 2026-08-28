const User = require('../models/user.model');
const Role = require('../../roles/models/role.model');
const Department = require('../../../models/Department');
const mongoose = require('mongoose');
const asyncHandler = require('../../../shared/utils/async-handler.util');
const AppError = require('../../../shared/errors/app.error');
const { HTTP_STATUS } = require('../../../constants');
const auditHelper = require('../../../shared/helpers/audit.helper');
const { AUDIT_ENTITIES } = require('../../audit/constants/audit.constants');

const sanitizeUser = (user) => {
  if (typeof user.toSafeObject === 'function') {
    return user.toSafeObject();
  }

  const sysRole = user.systemRole || (
    typeof user.role === 'object' && user.role !== null && user.role.name
      ? (user.role.name.toUpperCase().includes('SUPER') ? 'SUPER_ADMIN' : (user.role.name.toUpperCase().includes('ADMIN') ? 'ADMIN' : 'EMPLOYEE'))
      : 'EMPLOYEE'
  );

  const assignedRoleObj = user.assignedRole;
  const assignedRoleId = (typeof assignedRoleObj === 'object' && assignedRoleObj !== null && assignedRoleObj._id)
    ? assignedRoleObj._id.toString()
    : (user.assignedRole ? user.assignedRole.toString() : null);
  const assignedRoleLabel = (typeof assignedRoleObj === 'object' && assignedRoleObj !== null)
    ? (assignedRoleObj.label || assignedRoleObj.name || null)
    : null;

  const roleObj = user.role;
  const permissions = (typeof assignedRoleObj === 'object' && assignedRoleObj !== null && assignedRoleObj.permissions)
    ? assignedRoleObj.permissions
    : ((typeof roleObj === 'object' && roleObj !== null && roleObj.permissions) ? roleObj.permissions : []);

  const deptObj = user.department;
  const departmentId = (typeof deptObj === 'object' && deptObj !== null && deptObj._id)
    ? deptObj._id.toString()
    : (user.department ? user.department.toString() : null);
  const departmentName = (typeof deptObj === 'object' && deptObj !== null)
    ? (deptObj.name || deptObj.code || null)
    : null;

  return {
    id: user._id?.toString() || user.id,
    _id: user._id?.toString() || user.id,
    employeeCode: user.employeeCode || '',
    name: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,

    systemRole: sysRole,
    role: sysRole,

    assignedRole: typeof assignedRoleObj === 'object' ? assignedRoleObj : null,
    assignedRoleId,
    assignedRoleLabel,

    permissions,

    department: typeof deptObj === 'object' ? deptObj : null,
    departmentId,
    departmentName,

    designation: user.designation,
    profilePicture: user.profilePicture,
    isActive: user.isActive,
    isApproved: user.isApproved,
    isDeleted: user.isDeleted,
    status: user.status,
    accountStatus: user.status,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
};

const list = asyncHandler(async (req, res) => {
  const { status, role, search, deleted, department, page = 1, limit = 50, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
  const includeDeleted = deleted === 'true' || deleted === 'all';
  const filter = {};
  if (!includeDeleted) {
    filter.isDeleted = false;
  } else if (deleted === 'true') {
    filter.isDeleted = true;
  }
  if (status) {
    filter.status = status;
  }
  if (department && mongoose.Types.ObjectId.isValid(department)) {
    filter.department = new mongoose.Types.ObjectId(department);
  }

  // Strict Department Scoping: Department Admins only see employees in their department
  if (req.user && !req.user.isSuperAdmin && (req.user.role === 'admin' || req.user.systemRole === 'ADMIN')) {
    const userDeptId = (req.user.department?._id || req.user.department || req.user.departmentId)?.toString();
    if (userDeptId && mongoose.Types.ObjectId.isValid(userDeptId)) {
      filter.department = new mongoose.Types.ObjectId(userDeptId);
    }
  }
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  const sortField = ['fullName', 'email', 'createdAt', 'status'].includes(sortBy) ? sortBy : 'createdAt';
  const sort = { [sortField]: sortOrder === 'asc' ? 1 : -1 };
  const pageNumber = Math.max(Number(page) || 1, 1);
  const pageSize = Math.min(Math.max(Number(limit) || 25, 1), 100);

  const [users, total] = await Promise.all([
    User.find(filter)
      .setOptions(includeDeleted ? { withDeleted: true } : {})
      .populate('assignedRole')
      .populate('department')
      .populate('role')
      .sort(sort)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(filter).setOptions(includeDeleted ? { withDeleted: true } : {}),
  ]);
  
  let result = users;
  if (role) {
    result = users.filter((u) => {
      const sRole = (u.systemRole || '').toUpperCase();
      const aRole = (u.assignedRole?.name || u.role?.name || '').toLowerCase();
      return sRole === role.toUpperCase() || aRole === role.toLowerCase();
    });
  }

  res.json({
    success: true,
    data: result.map(sanitizeUser),
    meta: {
      page: pageNumber,
      limit: pageSize,
      total,
      totalPages: Math.max(Math.ceil(total / pageSize), 1),
    },
  });
});

const approve = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).populate('assignedRole').populate('department');
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  if (user.systemRole === 'EMPLOYEE') {
    if (!user.assignedRole || !user.department) {
      throw new AppError('Department and role assignment are required before approving an employee.', HTTP_STATUS.BAD_REQUEST);
    }
  } else if (user.systemRole === 'ADMIN') {
    if (!user.department) {
      throw new AppError('Department assignment is required before approving an administrator.', HTTP_STATUS.BAD_REQUEST);
    }
  }

  user.status = 'approved';
  user.isApproved = true;
  user.isActive = true;
  await user.save();
  await user.populate('assignedRole');
  await user.populate('department');

  await auditHelper.log({
    req,
    user: req.user?.id || req.user?._id,
    action: 'user.approve',
    entity: AUDIT_ENTITIES.USER,
    entityId: user._id,
    metadata: {
      targetUserName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      targetUserEmail: user.email,
      systemRole: user.systemRole,
      roleName: user.assignedRole?.label || user.assignedRole?.name,
      departmentName: user.department?.name,
    },
  });

  // Notify the approved user
  try {
    const notificationService = require('../../../services/notificationService');
    await notificationService.notify({
      recipient: user._id,
      sender: req.user?.id || req.user?._id,
      type: 'user_activated',
      category: 'team',
      title: 'Account Approved',
      message: `Your account registration has been approved. Welcome to TeamOrbit TMS!`,
      entityType: 'User',
      entityId: user._id.toString(),
      actionType: 'more_info',
      metadata: { userId: user._id.toString() },
    });
  } catch (notifErr) {
    console.error('Warning sending user approval notification:', notifErr);
  }

  res.json({ success: true, message: 'User approved successfully', data: sanitizeUser(user) });
});

const reject = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.status = 'rejected';
  user.isApproved = false;
  user.isActive = false;
  await user.save();
  await user.populate('assignedRole');
  await user.populate('department');

  await auditHelper.log({
    req,
    user: req.user?.id || req.user?._id,
    action: 'user.reject',
    entity: AUDIT_ENTITIES.USER,
    entityId: user._id,
    metadata: {
      targetUserName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      targetUserEmail: user.email,
    },
  });

  res.json({ success: true, message: 'User rejected successfully', data: sanitizeUser(user) });
});

const activate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.status = 'approved';
  user.isApproved = true;
  user.isActive = true;
  await user.save();
  await user.populate('assignedRole');
  await user.populate('department');

  res.json({ success: true, data: sanitizeUser(user) });
});

const deactivate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.isActive = false;
  await user.save();
  await user.populate('assignedRole');
  await user.populate('department');

  res.json({ success: true, data: sanitizeUser(user) });
});

const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) throw new AppError('Role is required', HTTP_STATUS.BAD_REQUEST);

  let roleDoc = await Role.findOne({ name: role });
  if (!roleDoc && role.length === 24) {
    roleDoc = await Role.findById(role);
  }
  if (!roleDoc || roleDoc.isDeleted) {
    throw new AppError('Invalid role specified', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { assignedRole: roleDoc._id }, { new: true })
    .populate('assignedRole')
    .populate('department');
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  res.json({ success: true, data: sanitizeUser(user) });
});

const assignDepartment = asyncHandler(async (req, res) => {
  const departmentId = req.body.departmentId || req.body.department;
  if (!departmentId) throw new AppError('Department ID is required', HTTP_STATUS.BAD_REQUEST);

  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  if (user.systemRole !== 'ADMIN') {
    throw new AppError('Admin department assignment endpoint is for administrators only.', HTTP_STATUS.BAD_REQUEST);
  }

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new AppError('Invalid department specified', HTTP_STATUS.BAD_REQUEST);
  }

  const department = await Department.findById(departmentId);
  if (!department || department.isDeleted || department.deletedAt) {
    throw new AppError('Invalid or deleted department specified', HTTP_STATUS.BAD_REQUEST);
  }

  user.department = department._id;
  await user.save();
  await user.populate('assignedRole');
  await user.populate('department');

  await auditHelper.log({
    req,
    user: req.user?.id || req.user?._id,
    action: 'user.assign_department',
    entity: AUDIT_ENTITIES.USER,
    entityId: user._id,
    metadata: {
      targetUserName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      targetUserEmail: user.email,
      departmentName: department.name,
    },
  });

  res.json({ success: true, message: 'Department assigned successfully', data: sanitizeUser(user) });
});

const assignRole = asyncHandler(async (req, res) => {
  const roleId = req.body.roleId || req.body.role;
  const departmentId = req.body.departmentId || req.body.department;

  const user = await User.findById(req.params.id);
  if (!user || user.isDeleted) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  if (user.systemRole !== 'EMPLOYEE') {
    throw new AppError('Assigned roles can only be set for employees.', HTTP_STATUS.BAD_REQUEST);
  }

  if (!roleId) throw new AppError('Role ID is required', HTTP_STATUS.BAD_REQUEST);
  if (!departmentId) throw new AppError('Department ID is required', HTTP_STATUS.BAD_REQUEST);

  let roleDoc = mongoose.Types.ObjectId.isValid(roleId)
    ? await Role.findById(roleId)
    : null;
  if (!roleDoc) {
    roleDoc = await Role.findOne({ name: roleId });
  }
  if (!roleDoc || roleDoc.isDeleted) {
    throw new AppError('Invalid or deleted role specified', HTTP_STATUS.BAD_REQUEST);
  }

  if (!mongoose.Types.ObjectId.isValid(departmentId)) {
    throw new AppError('Invalid department specified', HTTP_STATUS.BAD_REQUEST);
  }

  const deptDoc = await Department.findById(departmentId);
  if (!deptDoc || deptDoc.isDeleted || deptDoc.deletedAt) {
    throw new AppError('Invalid or deleted department specified', HTTP_STATUS.BAD_REQUEST);
  }

  user.assignedRole = roleDoc._id;
  user.department = deptDoc._id;
  await user.save();
  await user.populate('assignedRole');
  await user.populate('department');

  await auditHelper.log({
    req,
    user: req.user?.id || req.user?._id,
    action: 'user.assign_role',
    entity: AUDIT_ENTITIES.USER,
    entityId: user._id,
    metadata: {
      targetUserName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      targetUserEmail: user.email,
      roleName: roleDoc.label || roleDoc.name,
      departmentName: deptDoc.name,
    },
  });

  res.json({ success: true, message: 'Role and department assigned successfully', data: sanitizeUser(user) });
});

const remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, isActive: false, status: 'rejected' },
    { new: true }
  ).populate('assignedRole').populate('department');

  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  await auditHelper.log({
    req,
    user: req.user?.id || req.user?._id,
    action: 'user.delete',
    entity: AUDIT_ENTITIES.USER,
    entityId: user._id,
    metadata: {
      targetUserName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
      targetUserEmail: user.email,
    },
  });

  res.json({ success: true, message: 'User deleted successfully', data: sanitizeUser(user) });
});

module.exports = { list, approve, reject, activate, deactivate, updateRole, assignDepartment, assignRole, remove };
