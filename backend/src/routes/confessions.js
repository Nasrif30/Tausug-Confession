const express = require('express');
const { body, param } = require('express-validator');
const {
  createConfession,
  getConfessions,
  getConfessionById,
  updateConfession,
  createChapter,
  updateChapter,
  likeConfession,
  deleteConfession
} = require('../controllers/ConfessionController');
const { 
  authenticateToken, 
  requireMember,
  optionalAuth
} = require('../middleware/auth');

const router = express.Router();

// Validation rules
const confessionValidation = [
  body('title')
    .isLength({ min: 5, max: 200 })
    .trim()
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'family', 'love', 'friendship', 'school', 'work', 'personal', 'culture'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .isLength({ min: 1, max: 30 })
    .withMessage('Each tag must be between 1 and 30 characters'),
  body('coverImageUrl')
    .optional()
    .isURL()
    .withMessage('Cover image must be a valid URL')
];

const chapterValidation = [
  body('title')
    .isLength({ min: 3, max: 200 })
    .trim()
    .withMessage('Chapter title must be between 3 and 200 characters'),
  body('content')
    .isLength({ min: 50 })
    .trim()
    .withMessage('Chapter content must be at least 50 characters long')
];

const updateConfessionValidation = [
  body('title')
    .optional()
    .isLength({ min: 5, max: 200 })
    .trim()
    .withMessage('Title must be between 5 and 200 characters'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .trim()
    .withMessage('Description must not exceed 1000 characters'),
  body('category')
    .optional()
    .isIn(['general', 'family', 'love', 'friendship', 'school', 'work', 'personal', 'culture'])
    .withMessage('Invalid category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Invalid status')
];

const uuidValidation = [
  param('id').optional().isUUID().withMessage('Invalid confession ID'),
  param('confessionId').optional().isUUID().withMessage('Invalid confession ID'),
  param('chapterId').optional().isUUID().withMessage('Invalid chapter ID')
];

// Routes

// Public routes (with optional auth for likes)
router.get('/', optionalAuth, getConfessions);
router.get('/:id', uuidValidation, optionalAuth, getConfessionById);

// Protected routes - require authentication
router.post('/:id/like', uuidValidation, authenticateToken, likeConfession);

// Protected routes - require authentication only
router.post('/', authenticateToken, confessionValidation, createConfession);
router.put('/:id', uuidValidation, authenticateToken, updateConfessionValidation, updateConfession);
router.delete('/:id', uuidValidation, authenticateToken, deleteConfession);

// Chapter routes
router.post('/:confessionId/chapters', 
  uuidValidation, 
  authenticateToken, 
  chapterValidation, 
  createChapter
);

router.put('/:confessionId/chapters/:chapterId', 
  uuidValidation, 
  authenticateToken, 
  chapterValidation, 
  updateChapter
);

module.exports = router;
