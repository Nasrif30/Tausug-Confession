// server/src/routes/users.js
const express = require('express');
const {
  getUserById,
  getUserByUsername,
  getUserConfessions,
  followUser,
  unfollowUser,
  getUserFollowers,
  getUserFollowing,
  getUserProfile,
  getUserBookmarks
} = require('../controllers/userController');
const { 
  authenticateToken, 
  optionalAuth 
} = require('../middleware/auth');

const router = express.Router();

// Test route first
router.get('/test', (req, res) => res.json({ message: 'Users route working' }));

// User profile and bookmarks
router.get('/profile', authenticateToken, getUserProfile);
router.get('/bookmarks', authenticateToken, getUserBookmarks);
router.delete('/bookmarks/:id', authenticateToken, (req, res) => {
  // This will be implemented in the userController
  res.json({ success: true, message: 'Bookmark removed' });
});

// Simple routes without validation for now
router.get('/username/:username', getUserByUsername);
router.get('/:id', getUserById);
router.get('/:id/confessions', getUserConfessions);
router.get('/:id/followers', getUserFollowers);
router.get('/:id/following', getUserFollowing);

// Protected routes
router.post('/:id/follow', authenticateToken, followUser);
router.delete('/:id/follow', authenticateToken, unfollowUser);

module.exports = router;
