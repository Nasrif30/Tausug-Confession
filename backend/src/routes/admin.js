// server/src/routes/admin.js
const express = require('express');
const {
  getPlatformStats,
  getAllUsers,
  updateUserRole,
  toggleUserBan,
  deleteUser,
  getPendingReports,
  updateReportStatus
} = require('../controllers/adminController');
const { 
  authenticateToken, 
  requireAdmin,
  requireAdminOrModerator
} = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.get('/stats', requireAdmin, getPlatformStats);
router.get('/users', requireAdmin, getAllUsers);
router.put('/users/:userId/role', requireAdmin, updateUserRole);
router.put('/users/:userId/ban', requireAdmin, toggleUserBan);
router.delete('/users/:userId', requireAdmin, deleteUser);

// Admin and moderator routes
router.get('/reports', requireAdminOrModerator, getPendingReports);
router.put('/reports/:reportId', requireAdminOrModerator, updateReportStatus);

module.exports = router;
