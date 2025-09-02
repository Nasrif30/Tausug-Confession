// server/src/routes/auth.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const validateRequest = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('username').isLength({ min: 3, max: 50 }).matches(/^[a-zA-Z0-9_]+$/),
  body('fullName').trim().isLength({ min: 2, max: 100 })
];

const loginValidation = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
];

const profileUpdateValidation = [
  body('fullName').optional().trim().isLength({ min: 2, max: 100 }),
  body('bio').optional().trim().isLength({ max: 500 }),
  body('avatarUrl').optional().isURL()
];

// Routes
router.post('/register', registerValidation, validateRequest, authController.register);
router.post('/login', loginValidation, validateRequest, authController.login);


// Admin login route
router.post('/admin/login', loginValidation, validateRequest, authController.adminLogin);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, profileUpdateValidation, validateRequest, authController.updateProfile);
router.post('/upgrade', authenticateToken, authController.upgradeToMember);
router.post('/avatar', authenticateToken, authController.updateAvatar);

module.exports = router;