const express = require('express');
const { body, param } = require('express-validator');
const enrollmentController = require('../controllers/enrollmentController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @route   POST /enrollments
 * @desc    Create a new enrollment (Book a seat)
 * @access  Private (Students only)
 */
router.post(
  '/',
  authenticateToken,
  [body('batchId').isInt({ min: 1 }).withMessage('Valid batch ID is required')],
  enrollmentController.createEnrollment
);

/**
 * @route   GET /enrollments/my-enrollments
 * @desc    Get all enrollments for the authenticated user
 * @access  Private
 */
router.get('/my-enrollments', authenticateToken, enrollmentController.getMyEnrollments);

/**
 * @route   GET /enrollments/batch/:batchId
 * @desc    Get all enrollments for a specific batch
 * @access  Private (Admin/Instructor only)
 */
router.get(
  '/batch/:batchId',
  authenticateToken,
  authorize('ADMIN', 'INSTRUCTOR'),
  [param('batchId').isInt({ min: 1 }).withMessage('Valid batch ID is required')],
  enrollmentController.getBatchEnrollments
);

/**
 * @route   PATCH /enrollments/:enrollmentId/status
 * @desc    Update enrollment status
 * @access  Private (Admin/Instructor only)
 */
router.patch(
  '/:enrollmentId/status',
  authenticateToken,
  authorize('ADMIN', 'INSTRUCTOR'),
  [
    param('enrollmentId').isUUID().withMessage('Valid enrollment ID is required'),
    body('status')
      .isIn(['PENDING', 'CONFIRMED'])
      .withMessage('Status must be PENDING or CONFIRMED'),
  ],
  enrollmentController.updateEnrollmentStatus
);

/**
 * @route   DELETE /enrollments/:enrollmentId
 * @desc    Cancel enrollment
 * @access  Private (Student can cancel own, Admin can cancel any)
 */
router.delete(
  '/:enrollmentId',
  authenticateToken,
  [param('enrollmentId').isUUID().withMessage('Valid enrollment ID is required')],
  enrollmentController.cancelEnrollment
);

module.exports = router;
