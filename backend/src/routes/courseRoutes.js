const express = require('express');
const { body, param } = require('express-validator');
const courseController = require('../controllers/courseController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @route   POST /courses
 * @desc    Create a new course
 * @access  Private (Admin/Instructor only)
 */
router.post(
  '/',
  authenticateToken,
  authorize('ADMIN', 'INSTRUCTOR'),
  [
    body('title').notEmpty().withMessage('Course title is required'),
    body('description').optional().isString(),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
    body('organization_id').optional().isString(),
  ],
  courseController.createCourse
);

/**
 * @route   GET /courses
 * @desc    Get all courses
 * @access  Public
 */
router.get('/', courseController.getAllCourses);

/**
 * @route   GET /courses/:courseId
 * @desc    Get course by ID
 * @access  Public
 */
router.get(
  '/:courseId',
  [param('courseId').isInt({ min: 1 }).withMessage('Valid course ID is required')],
  courseController.getCourseById
);

/**
 * @route   PATCH /courses/:courseId
 * @desc    Update course
 * @access  Private (Admin/Instructor only)
 */
router.patch(
  '/:courseId',
  authenticateToken,
  authorize('ADMIN', 'INSTRUCTOR'),
  [
    param('courseId').isInt({ min: 1 }).withMessage('Valid course ID is required'),
    body('title').optional().notEmpty().withMessage('Course title cannot be empty'),
    body('description').optional().isString(),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  ],
  courseController.updateCourse
);

/**
 * @route   DELETE /courses/:courseId
 * @desc    Delete course
 * @access  Private (Admin only)
 */
router.delete(
  '/:courseId',
  authenticateToken,
  authorize('ADMIN'),
  [param('courseId').isInt({ min: 1 }).withMessage('Valid course ID is required')],
  courseController.deleteCourse
);

module.exports = router;
