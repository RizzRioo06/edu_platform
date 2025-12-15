const batchService = require('../services/batchService');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Create a new batch
 * POST /batches
 */
const createBatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { courseId, startDate, maxSeats } = req.body;

    const batch = await batchService.createBatch(courseId, startDate, maxSeats);

    res.status(201).json({
      success: true,
      message: 'Batch created successfully',
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all batches
 * GET /batches
 */
const getAllBatches = async (req, res, next) => {
  try {
    const { courseId } = req.query;

    const batches = await batchService.getAllBatches({
      courseId: courseId ? parseInt(courseId) : undefined,
    });

    res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get available batches (with seats remaining)
 * GET /batches/available
 */
const getAvailableBatches = async (req, res, next) => {
  try {
    const batches = await batchService.getAvailableBatches();

    res.status(200).json({
      success: true,
      data: batches,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get batch by ID
 * GET /batches/:batchId
 */
const getBatchById = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const batch = await batchService.getBatchById(parseInt(batchId));

    res.status(200).json({
      success: true,
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update batch
 * PATCH /batches/:batchId
 */
const updateBatch = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { batchId } = req.params;
    const updateData = req.body;

    const batch = await batchService.updateBatch(parseInt(batchId), updateData);

    res.status(200).json({
      success: true,
      message: 'Batch updated successfully',
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete batch
 * DELETE /batches/:batchId
 */
const deleteBatch = async (req, res, next) => {
  try {
    const { batchId } = req.params;

    const result = await batchService.deleteBatch(parseInt(batchId));

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBatch,
  getAllBatches,
  getAvailableBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
};
