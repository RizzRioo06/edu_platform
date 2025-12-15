const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Create a new batch for a course
 */
const createBatch = async (courseId, startDate, maxSeats) => {
  // Verify course exists
  const course = await prisma.course.findUnique({
    where: { id: courseId },
  });

  if (!course) {
    throw new ApiError(404, 'Course not found');
  }

  const batch = await prisma.batch.create({
    data: {
      courseId,
      startDate: new Date(startDate),
      maxSeats,
      currentEnrolled: 0,
    },
    include: {
      course: true,
    },
  });

  return batch;
};

/**
 * Get all batches with optional filters
 */
const getAllBatches = async (filters = {}) => {
  const { courseId } = filters;

  const where = {};
  if (courseId) {
    where.courseId = courseId;
  }

  const batches = await prisma.batch.findMany({
    where,
    include: {
      course: {
        select: {
          id: true,
          title: true,
          price: true,
        },
      },
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return batches;
};

/**
 * Get batch by ID
 */
const getBatchById = async (batchId) => {
  const batch = await prisma.batch.findUnique({
    where: { id: batchId },
    include: {
      course: true,
      _count: {
        select: {
          enrollments: true,
        },
      },
    },
  });

  if (!batch) {
    throw new ApiError(404, 'Batch not found');
  }

  return batch;
};

/**
 * Update batch
 */
const updateBatch = async (batchId, updateData) => {
  // If startDate is being updated, convert to Date
  if (updateData.startDate) {
    updateData.startDate = new Date(updateData.startDate);
  }

  // Don't allow direct update of currentEnrolled (should be handled via enrollments)
  if (updateData.currentEnrolled !== undefined) {
    delete updateData.currentEnrolled;
  }

  const batch = await prisma.batch.update({
    where: { id: batchId },
    data: updateData,
    include: {
      course: true,
    },
  });

  return batch;
};

/**
 * Delete batch
 */
const deleteBatch = async (batchId) => {
  await prisma.batch.delete({
    where: { id: batchId },
  });

  return { message: 'Batch deleted successfully' };
};

/**
 * Get available batches (with seats remaining)
 */
const getAvailableBatches = async () => {
  const batches = await prisma.batch.findMany({
    where: {
      currentEnrolled: {
        lt: prisma.batch.fields.maxSeats,
      },
      startDate: {
        gte: new Date(),
      },
    },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
        },
      },
    },
    orderBy: {
      startDate: 'asc',
    },
  });

  return batches;
};

module.exports = {
  createBatch,
  getAllBatches,
  getBatchById,
  updateBatch,
  deleteBatch,
  getAvailableBatches,
};
