const enrollmentService = require('../services/enrollmentService');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Create a new enrollment (Book a seat)
 * POST /enrollments
 */
const createEnrollment = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { batchId } = req.body;
    const userId = req.user.id;

    const enrollment = await enrollmentService.createEnrollment(userId, batchId);

    res.status(201).json({
      success: true,
      message: 'Enrollment created successfully',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all enrollments for the authenticated user
 * GET /enrollments/my-enrollments
 */
const getMyEnrollments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const enrollments = await enrollmentService.getUserEnrollments(userId);

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all enrollments for a specific batch (Admin/Instructor only)
 * GET /enrollments/batch/:batchId
 */
const getBatchEnrollments = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const enrollments = await enrollmentService.getBatchEnrollments(parseInt(batchId));

    res.status(200).json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update enrollment status (Admin/Instructor only)
 * PATCH /enrollments/:enrollmentId/status
 */
const updateEnrollmentStatus = async (req, res, next) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { enrollmentId } = req.params;
    const { status } = req.body;

    const enrollment = await enrollmentService.updateEnrollmentStatus(enrollmentId, status);

    res.status(200).json({
      success: true,
      message: 'Enrollment status updated successfully',
      data: enrollment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Cancel enrollment
 * DELETE /enrollments/:enrollmentId
 */
const cancelEnrollment = async (req, res, next) => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const result = await enrollmentService.cancelEnrollment(enrollmentId, userId, userRole);

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createEnrollment,
  getMyEnrollments,
  getBatchEnrollments,
  updateEnrollmentStatus,
  cancelEnrollment,
};
