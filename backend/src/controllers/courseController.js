const courseService = require('../services/courseService');
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

/**
 * Create a new course
 * POST /courses
 */
const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { title, description, price, organization_id } = req.body;

    const course = await courseService.createCourse(title, description, price, organization_id);

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all courses
 * GET /courses
 */
const getAllCourses = async (req, res, next) => {
  try {
    const { organization_id } = req.query;

    const courses = await courseService.getAllCourses({ organization_id });

    res.status(200).json({
      success: true,
      data: courses,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course by ID
 * GET /courses/:courseId
 */
const getCourseById = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await courseService.getCourseById(parseInt(courseId));

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update course
 * PATCH /courses/:courseId
 */
const updateCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new ApiError(400, 'Validation failed', errors.array());
    }

    const { courseId } = req.params;
    const updateData = req.body;

    const course = await courseService.updateCourse(parseInt(courseId), updateData);

    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      data: course,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete course
 * DELETE /courses/:courseId
 */
const deleteCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const result = await courseService.deleteCourse(parseInt(courseId));

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
