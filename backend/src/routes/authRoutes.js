const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/auth');
const passport = require('../config/passport');

const router = express.Router();

/**
 * @route   POST /auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['STUDENT', 'ADMIN', 'INSTRUCTOR'])
      .withMessage('Role must be STUDENT, ADMIN, or INSTRUCTOR'),
  ],
  authController.register
);

/**
 * @route   POST /auth/login
 * @desc    Login user
 * @access  Public
 */
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

/**
 * @route   GET /auth/google
 * @desc    Initiate Google OAuth
 * @access  Public
 */
router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

/**
 * @route   GET /auth/google/callback
 * @desc    Google OAuth callback
 * @access  Public
 */
router.get(
  '/google/callback',
  passport.authenticate('google', { 
    session: false,
    failureRedirect: process.env.FRONTEND_URL || 'http://localhost:5173/login?error=auth_failed'
  }),
  authController.googleCallback
);

/**
 * @route   POST /auth/logout
 * @desc    Logout user (blacklist token)
 * @access  Private
 */
router.post('/logout', authenticateToken, authController.logout);

/**
 * @route   DELETE /auth/account
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/account',
  authenticateToken,
  [
    body('password')
      .optional()
      .notEmpty()
      .withMessage('Password is required for local accounts'),
  ],
  authController.deleteAccount
);

module.exports = router;
