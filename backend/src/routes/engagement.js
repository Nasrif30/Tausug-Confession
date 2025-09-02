const express = require('express');
const engagementController = require('../controllers/engagementController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Like/unlike confessions
router.post('/confessions/:confessionId/like', engagementController.toggleLike);

// Bookmark/unbookmark confessions
router.post('/confessions/:confessionId/bookmark', engagementController.toggleBookmark);

// Get user bookmarks
router.get('/bookmarks', engagementController.getUserBookmarks);

// Get user badges
router.get('/users/:userId/badges', engagementController.getUserBadges);

// Award badge (moderator/admin only)
router.post('/badges/award', engagementController.awardBadge);

module.exports = router;
