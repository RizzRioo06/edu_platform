const express = require('express');
const { body, param } = require('express-validator');
const batchController = require('../controllers/batchController');
const { authenticateToken, authorize } = require('../middlewares/auth');

const router = express.Router();

/**
 * @route   POST /batches
 * @desc    Create a new batch
 * @access  Private (Admin/Instructor only)
 */
router.post(
  '/',
  authenticateToken,
  authorize('ADMIN', 'INSTRUCTOR'),
  [
    body('courseId').isInt({ min: 1 }).withMessage('Valid course ID is required'),
    body('startDate').isISO8601().withMessage('Valid start date is required (ISO 8601 format)'),
    body('maxSeats').isInt({ min: 1 }).withMessage('Max seats must be at least 1'),
  ],
  batchController.createBatch
);

/**
 * @route   GET /batches
 * @desc    Get all batches
 * @access  Public
 */
router.get('/', batchController.getAllBatches);

/**
 * @route   GET /batches/available
 * @desc    Get available batches (with seats remaining)
 * @access  Public
 */
router.get('/available', batchController.getAvailableBatches);

/**
 * @route   GET /batches/:batchId
 * @desc    Get batch by ID
 * @access  Public
 */
router.get(
  '/:batchId',
  [param('batchId').isInt({ min: 1 }).withMessage('Valid batch ID is required')],
  batchController.getBatchById
);

/**
 * @route   PATCH /batches/:batchId
 * @desc    Update batch
 * @access  Private (Admin/Instructor only)
 */
router.patch(
  '/:batchId',
  authenticateToken,
  authorize('ADMIN', 'INSTRUCTOR'),
  [
    param('batchId').isInt({ min: 1 }).withMessage('Valid batch ID is required'),
    body('startDate').optional().isISO8601().withMessage('Valid start date is required'),
    body('maxSeats').optional().isInt({ min: 1 }).withMessage('Max seats must be at least 1'),
  ],
  batchController.updateBatch
);

/**
 * @route   DELETE /batches/:batchId
 * @desc    Delete batch
 * @access  Private (Admin only)
 */
router.delete(
  '/:batchId',
  authenticateToken,
  authorize('ADMIN'),
  [param('batchId').isInt({ min: 1 }).withMessage('Valid batch ID is required')],
  batchController.deleteBatch
);

module.exports = router;
