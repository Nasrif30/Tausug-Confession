// server/src/routes/comments.js
const express = require('express');
const {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  toggleCommentLike
} = require('../controllers/commentController');
const { 
  authenticateToken
} = require('../middleware/auth');

const router = express.Router();

// Simple routes without validation for now
router.get('/:confessionId', getComments);
router.post('/:confessionId', authenticateToken, createComment);
router.put('/:confessionId/:commentId', authenticateToken, updateComment);
router.delete('/:confessionId/:commentId', authenticateToken, deleteComment);
router.post('/:confessionId/:commentId/like', authenticateToken, toggleCommentLike);

module.exports = router;
