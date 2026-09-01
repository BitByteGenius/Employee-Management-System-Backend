/**
 * seed.js — Startup database seeding job.
 * Automatically ensures system roles and the Super Admin user account exist in MongoDB.
 */
'use strict';

const Role = require('../modules/roles/models/role.model');
const User = require('../modules/user/models/user.model');
const { ROLES, PERMISSIONS, DEFAULT_ROLE_PERMISSIONS } = require('../constants/roles');
const env = require('../config/env');

const seedSuperAdmin = async () => {
  try {
    // 1. Seed Roles
    const rolesToSeed = [
      {
        name: ROLES.SUPER_ADMIN,
        label: 'Super Admin',
        description: 'System-wide full access role',
        permissions: DEFAULT_ROLE_PERMISSIONS[ROLES.SUPER_ADMIN] || Object.values(PERMISSIONS),
        isSystem: true,
      },
      {
        name: ROLES.ADMIN,
        label: 'Department Admin',
        description: 'Departmental management role',
        permissions: DEFAULT_ROLE_PERMISSIONS[ROLES.ADMIN] || [],
        isSystem: true,
      },
      {
        name: ROLES.EMPLOYEE,
        label: 'Employee',
        description: 'Standard employee role',
        permissions: DEFAULT_ROLE_PERMISSIONS[ROLES.EMPLOYEE] || [],
        isSystem: true,
      },
    ];

    const roleDocs = {};
    for (const r of rolesToSeed) {
      try {
        let doc = await Role.findOne({ name: r.name }).withDeleted();
        if (!doc) {
          doc = await Role.create(r);
          console.log(`[Seed] Created role: ${r.name}`);
        } else {
          // Keep permissions updated
          doc.permissions = r.permissions;
          doc.label = r.label;
          doc.description = r.description;
          doc.isSystem = r.isSystem;
          doc.isDeleted = false;
          await doc.save();
          console.log(`[Seed] Updated role: ${r.name}`);
        }
        roleDocs[r.name] = doc;
      } catch (roleError) {
        // If role creation fails (e.g., duplicate), try to find it
        console.warn(`[Seed] Role creation failed for ${r.name}:`, roleError.message);
        const doc = await Role.findOne({ name: r.name }).withDeleted();
        if (doc) {
          doc.permissions = r.permissions;
          doc.label = r.label;
          doc.description = r.description;
          doc.isSystem = r.isSystem;
          doc.isDeleted = false;
          await doc.save();
          roleDocs[r.name] = doc;
          console.log(`[Seed] Using existing role: ${r.name}`);
        } else {
          throw roleError;
        }
      }
    }

    // 2. Seed Super Admin User
    const superAdminEmail = (env.SUPER_ADMIN_EMAIL || process.env.SUPER_ADMIN_EMAIL || 'superadmin@teamorbit.com').toLowerCase().trim();
    const superAdminPassword = env.SUPER_ADMIN_PASSWORD || process.env.SUPER_ADMIN_PASSWORD || 'SuperAdmin@123';
    const superAdminName = env.SUPER_ADMIN_NAME || process.env.SUPER_ADMIN_NAME || 'Super Admin';

    try {
      let superAdminUser = await User.findOne({ email: superAdminEmail }).select('+password').withDeleted();

      const nameParts = superAdminName.trim().split(' ');
      const firstName = nameParts[0] || 'Super';
      const lastName = nameParts.slice(1).join(' ') || 'Admin';

      if (!superAdminUser) {
        superAdminUser = new User({
          employeeCode: 'EMP0001',
          firstName,
          lastName,
          fullName: superAdminName,
          email: superAdminEmail,
          password: superAdminPassword, // pre-save hook will hash it
          systemRole: 'SUPER_ADMIN',
          assignedRole: roleDocs[ROLES.SUPER_ADMIN]._id,
          role: roleDocs[ROLES.SUPER_ADMIN]._id,
          status: 'approved',
          isApproved: true,
          isActive: true,
          isEmailVerified: true,
        });
        await superAdminUser.save();
        console.log(`[Seed] Created Super Admin account: ${superAdminEmail}`);
      } else {
        // Ensure role, status, active state, and password are correctly set
        superAdminUser.systemRole = 'SUPER_ADMIN';
        superAdminUser.assignedRole = roleDocs[ROLES.SUPER_ADMIN]._id;
        superAdminUser.role = roleDocs[ROLES.SUPER_ADMIN]._id;
        superAdminUser.status = 'approved';
        superAdminUser.isApproved = true;
        superAdminUser.isActive = true;
        if (superAdminPassword && !await superAdminUser.comparePassword(superAdminPassword)) {
          superAdminUser.password = superAdminPassword;
        }
        await superAdminUser.save();
        console.log(`[Seed] Verified Super Admin account: ${superAdminEmail}`);
      }

      // 3. Migrate existing users if systemRole is not set
      try {
        const unmigratedUsers = await User.find({
          $or: [{ systemRole: { $exists: false } }, { systemRole: null }],
        }).populate('role').withDeleted();

        for (const u of unmigratedUsers) {
          const roleName = (u.role?.name || '').toLowerCase();
          if (roleName.includes('super')) {
            u.systemRole = 'SUPER_ADMIN';
            u.assignedRole = u.role?._id || null;
          } else if (roleName.includes('admin')) {
            u.systemRole = 'ADMIN';
            u.assignedRole = null;
          } else {
            u.systemRole = 'EMPLOYEE';
            u.assignedRole = (u.role && u.role.name !== 'employee') ? u.role._id : null;
          }
          await u.save();
          console.log(`[Seed/Migration] Migrated user ${u.email} -> systemRole: ${u.systemRole}`);
        }
      } catch (migError) {
        console.warn('[Seed/Migration] Migration warning:', migError.message);
      }
      // 4. Seed sample TimeLog entries if empty
      try {
        const TimeLog = require('../models/TimeLog');
        const count = await TimeLog.countDocuments();
        if (count === 0 && superAdminUser) {
          await TimeLog.create([
            {
              user: superAdminUser._id,
              taskName: 'TMS Core Architecture & Cloudinary Upload Pipeline',
              hours: 7.5,
              date: new Date(),
              status: 'approved',
              notes: 'Setup secure cloud file uploading and JWT session resolution.',
            },
            {
              user: superAdminUser._id,
              taskName: 'Admin Dashboard & Real Role Enforcement',
              hours: 6.0,
              date: new Date(),
              status: 'approved',
              notes: 'Implemented persistent top bar and dynamic role badge.',
            },
            {
              user: superAdminUser._id,
              taskName: 'Department Workforce Scoping & Permissions',
              hours: 5.5,
              date: new Date(Date.now() - 86400000),
              status: 'approved',
              notes: 'Configured department isolation for task delegation.',
            },
          ]);
          console.log('[Seed] Created initial TimeLog records in MongoDB.');
        }
      } catch (timeLogError) {
        console.warn('[Seed] TimeLog seeding warning:', timeLogError.message);
      }

      // 5. Seed initial Notifications for users if empty
      try {
        const Notification = require('../models/Notification');
        const notifCount = await Notification.countDocuments();
        const allUsers = await User.find({ isDeleted: false });

        if (notifCount === 0 && allUsers.length > 0) {
          const now = Date.now();
          const seedNotifications = [];

          for (const u of allUsers) {
            seedNotifications.push(
              {
                recipient: u._id,
                title: 'Project Alpha: New Task Assigned',
                message: 'Sarah Jenkins assigned a new priority task to your queue regarding the Q3 marketing deliverables.',
                type: 'task_assigned',
                category: 'projects',
                entityType: 'Task',
                entityId: 'alpha-task-1',
                isRead: false,
                readAt: null,
                priority: 'high',
                actionType: 'view_task',
                metadata: { taskId: 'alpha-task-1', projectName: 'Project Alpha' },
                createdAt: new Date(now - 10 * 60 * 1000), // 10m ago
              },
              {
                recipient: u._id,
                title: 'System Maintenance Scheduled',
                message: 'Servers will be down for routine maintenance on Saturday, Oct 28th from 02:00 AM to 04:00 AM UTC.',
                type: 'system_alert',
                category: 'system',
                entityType: 'System',
                entityId: 'sys-maint-1',
                isRead: true,
                readAt: new Date(now - 3600 * 1000),
                priority: 'medium',
                actionType: 'more_info',
                metadata: { announcement: 'Scheduled maintenance window.' },
                createdAt: new Date(now - 2 * 3600 * 1000), // 2h ago
              },
              {
                recipient: u._id,
                title: 'Team Onboarding & Workspace Sync',
                message: 'Your department workspace has been synchronized. Welcome to TeamOrbit TMS!',
                type: 'team_update',
                category: 'team',
                entityType: 'User',
                entityId: u._id.toString(),
                isRead: false,
                readAt: null,
                priority: 'low',
                actionType: 'more_info',
                createdAt: new Date(now - 5 * 3600 * 1000), // 5h ago
              }
            );
          }

          await Notification.insertMany(seedNotifications);
          console.log(`[Seed] Created ${seedNotifications.length} sample Notification records.`);
        }
      } catch (notifSeedErr) {
        console.warn('[Seed] Notification seeding warning:', notifSeedErr.message);
      }

      // 6. Seed sample AuditLog entries if empty
      try {
        const AuditLog = require('../models/AuditLog');
        const logCount = await AuditLog.countDocuments();
        if (logCount === 0 && superAdminUser) {
          const now = Date.now();
          await AuditLog.create([
            {
              actor: superAdminUser._id,
              action: 'project.create',
              entityType: 'Project',
              entityId: 'proj-001',
              metadata: {
                name: 'Project Alpha',
                actorName: 'David Vance',
                targetUserName: 'David Vance',
              },
              createdAt: new Date(now - 3 * 3600 * 1000), // 3 hours ago
            },
            {
              actor: superAdminUser._id,
              action: 'task.create',
              entityType: 'Task',
              entityId: 'task-001',
              metadata: {
                title: 'Q3 Marketing Deliverables Review',
                actorName: 'Sarah Jenkins',
                targetUserName: 'Sarah Jenkins',
              },
              createdAt: new Date(now - 5 * 3600 * 1000), // 5 hours ago
            },
            {
              actor: superAdminUser._id,
              action: 'user.approve',
              entityType: 'User',
              entityId: superAdminUser._id,
              metadata: {
                actorName: 'Super Admin',
                targetUserName: 'Elena Rostova',
                roleName: 'Department Admin',
              },
              createdAt: new Date(now - 24 * 3600 * 1000), // 1 day ago
            },
          ]);
          console.log('[Seed] Created initial AuditLog records for Recent Activity.');
        }
      } catch (auditSeedErr) {
        console.warn('[Seed] AuditLog seeding warning:', auditSeedErr.message);
      }
    } catch (userError) {
      console.error('[Seed] Error seeding Super Admin user:', userError.message);
      // Don't rethrow - allow system to continue even if user creation fails
    }
  } catch (error) {
    console.error('[Seed] Error during seeding:', error.message);
    // Don't rethrow - allow system to continue even if seeding fails
  }
};

if (require.main === module) {
  require('dotenv').config();
  const connectDb = require('../config/db');
  connectDb()
    .then(async () => {
      await seedSuperAdmin();
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed execution error:', err);
      process.exit(1);
    });
}

module.exports = seedSuperAdmin;
