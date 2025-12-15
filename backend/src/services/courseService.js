const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Create a new course
 */
const createCourse = async (title, description, price, organization_id) => {
  const course = await prisma.course.create({
    data: {
      title,
      description,
      price,
      organization_id,
    },
  });

  return course;
};

/**
 * Get all courses with optional filters
 */
const getAllCourses = async (filters = {}) => {
  const { organization_id } = filters;

  const where = {};
  if (organization_id) {
    where.organization_id = organization_id;
  }

  const courses = await prisma.course.findMany({
    where,
    include: {
      batches: {
        select: {
          id: true,
          startDate: true,
          maxSeats: true,
          currentEnrolled: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return courses;
};

/**
 * Get course by ID
 */
const getCourseById = async (courseId) => {
  const course = await prisma.course.findUnique({
    where: { id: courseId },
    include: {
      batches: {
        select: {
          id: true,
          startDate: true,
          maxSeats: true,
          currentEnrolled: true,
        },
      },
    },
  });

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  return course;
};

/**
 * Update course
 */
const updateCourse = async (courseId, updateData) => {
  const course = await prisma.course.update({
    where: { id: courseId },
    data: updateData,
  });

  return course;
};

/**
 * Delete course
 */
const deleteCourse = async (courseId) => {
  await prisma.course.delete({
    where: { id: courseId },
  });

  return { message: 'Course deleted successfully' };
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
};
