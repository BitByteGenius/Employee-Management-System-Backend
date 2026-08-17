const User = require('../models/user.model');
const Role = require('../../roles/models/role.model');
const Department = require('../../../models/Department');
const mongoose = require('mongoose');
const asyncHandler = require('../../../shared/utils/async-handler.util');
const AppError = require('../../../shared/errors/app.error');
const { HTTP_STATUS } = require('../../../constants');

const sanitizeUser = (user) => {
  if (typeof user.toSafeObject === 'function') {
    return user.toSafeObject();
  }
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
    role: typeof user.role === 'object' && user.role !== null ? (user.role.name || 'employee') : String(user.role || 'employee'),
    permissions: typeof user.role === 'object' && user.role !== null ? (user.role.permissions || []) : [],
    department: user.department,
    designation: user.designation,
    isActive: user.isActive,
    isApproved: user.isApproved,
    isDeleted: user.isDeleted,
    status: user.status,
    accountStatus: user.status,
    createdAt: user.createdAt,
  };
};

const list = asyncHandler(async (req, res) => {
  const { status, role, search, deleted, page = 1, limit = 25, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
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
      .populate('role')
      .populate('department')
      .sort(sort)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize),
    User.countDocuments(filter).setOptions(includeDeleted ? { withDeleted: true } : {}),
  ]);
  
  let result = users;
  if (role) {
    result = users.filter((u) => {
      const rName = typeof u.role === 'object' && u.role !== null ? u.role.name : String(u.role);
      return rName.toLowerCase() === role.toLowerCase();
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
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.status = 'approved';
  user.isApproved = true;
  user.isActive = true;
  await user.save();
  await user.populate('role');

  res.json({ success: true, data: sanitizeUser(user) });
});

const reject = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.status = 'rejected';
  user.isApproved = false;
  user.isActive = false;
  await user.save();
  await user.populate('role');

  res.json({ success: true, data: sanitizeUser(user) });
});

const activate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.status = 'approved';
  user.isApproved = true;
  user.isActive = true;
  await user.save();
  await user.populate('role');

  res.json({ success: true, data: sanitizeUser(user) });
});

const deactivate = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  user.isActive = false;
  await user.save();
  await user.populate('role');

  res.json({ success: true, data: sanitizeUser(user) });
});

const updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!role) throw new AppError('Role is required', HTTP_STATUS.BAD_REQUEST);

  let roleDoc = await Role.findOne({ name: role });
  if (!roleDoc && role.length === 24) {
    roleDoc = await Role.findById(role);
  }
  if (!roleDoc) {
    throw new AppError('Invalid role specified', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findByIdAndUpdate(req.params.id, { role: roleDoc._id }, { new: true }).populate('role');
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  res.json({ success: true, data: sanitizeUser(user) });
});

const assignDepartment = asyncHandler(async (req, res) => {
  const { departmentId } = req.body;
  if (!departmentId) throw new AppError('Department is required', HTTP_STATUS.BAD_REQUEST);

  const department = await Department.findById(departmentId);
  if (!department || department.deletedAt) {
    throw new AppError('Invalid department specified', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { department: department._id },
    { new: true },
  ).populate('role').populate('department');
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  res.json({ success: true, data: sanitizeUser(user) });
});

const assignRole = asyncHandler(async (req, res) => {
  const { roleId, role } = req.body;
  const requestedRole = roleId || role;
  if (!requestedRole) throw new AppError('Role is required', HTTP_STATUS.BAD_REQUEST);

  let roleDoc = mongoose.Types.ObjectId.isValid(requestedRole)
    ? await Role.findById(requestedRole)
    : null;
  if (!roleDoc) {
    roleDoc = await Role.findOne({ name: requestedRole });
  }
  if (!roleDoc) {
    throw new AppError('Invalid role specified', HTTP_STATUS.BAD_REQUEST);
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role: roleDoc._id },
    { new: true },
  ).populate('role').populate('department');
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  res.json({ success: true, data: sanitizeUser(user) });
});

const remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, isActive: false, status: 'rejected' },
    { new: true }
  ).populate('role').populate('department');
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  res.json({ success: true, message: 'User deleted successfully', data: sanitizeUser(user) });
});

module.exports = { list, approve, reject, activate, deactivate, updateRole, assignDepartment, assignRole, remove };
