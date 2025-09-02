const express = require('express');
const moderatorController = require('../controllers/moderatorController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get content for moderation
router.get('/content', moderatorController.getContentForModeration);

// Moderate comments
router.post('/comments/:commentId', moderatorController.moderateComment);

// Moderate confessions
router.post('/confessions/:confessionId', moderatorController.moderateConfession);

// Get moderation statistics
router.get('/stats', moderatorController.getModerationStats);

module.exports = router;
