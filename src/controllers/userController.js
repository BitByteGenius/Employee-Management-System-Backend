const User = require('../modules/auth/models/user.model');
const Role = require('../modules/auth/models/role.model');
const asyncHandler = require('../shared/utils/async-handler.util');
const AppError = require('../shared/errors/app.error');
const { HTTP_STATUS } = require('../constants');

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
    status: user.status,
    accountStatus: user.status,
  };
};

const list = asyncHandler(async (req, res) => {
  const { status, role, search } = req.query;
  const filter = { isDeleted: false };
  if (status) {
    filter.$or = [{ status }, { accountStatus: status }];
  }
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }
  
  const users = await User.find(filter).populate('role').sort({ createdAt: -1 });
  
  let result = users;
  if (role) {
    result = users.filter((u) => {
      const rName = typeof u.role === 'object' && u.role !== null ? u.role.name : String(u.role);
      return rName.toLowerCase() === role.toLowerCase();
    });
  }

  res.json({ success: true, data: result.map(sanitizeUser) });
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

const remove = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isDeleted: true, isActive: false, status: 'rejected' },
    { new: true }
  );
  if (!user) throw new AppError('User not found', HTTP_STATUS.NOT_FOUND);

  res.json({ success: true, message: 'User deleted successfully' });
});

module.exports = { list, approve, reject, activate, deactivate, updateRole, remove };

