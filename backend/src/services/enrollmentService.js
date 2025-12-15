const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/**
 * CRITICAL: Secure Enrollment Logic with Transaction
 * This function handles booking a seat and MUST prevent race conditions (overbooking)
 * using Prisma transactions to ensure data consistency.
 */
const createEnrollment = async (userId, batchId) => {
  // Use Prisma transaction to prevent race conditions
  const enrollment = await prisma.$transaction(async (tx) => {
    // Step 1: Fetch the batch and lock the row for update
    const batch = await tx.batch.findUnique({
      where: { id: batchId },
    });

    if (!batch) {
      throw new ApiError(404, 'Batch not found');
    }

    // Step 2: Check if batch is full (prevent overbooking)
    if (batch.currentEnrolled >= batch.maxSeats) {
      throw new ApiError(400, 'Batch is full. No seats available.');
    }

    // Step 3: Check if user is already enrolled in this batch
    const existingEnrollment = await tx.enrollment.findUnique({
      where: {
        userId_batchId: {
          userId,
          batchId,
        },
      },
    });

    if (existingEnrollment) {
      throw new ApiError(409, 'You are already enrolled in this batch');
    }

    // Step 4: Create the enrollment record
    const newEnrollment = await tx.enrollment.create({
      data: {
        userId,
        batchId,
        status: 'PENDING',
      },
      include: {
        batch: {
          include: {
            course: true,
          },
        },
        user: {
          select: {
            id: true,
            email: true,
            role: true,
          },
        },
      },
    });

    // Step 5: Update batch - increment currentEnrolled by 1
    await tx.batch.update({
      where: { id: batchId },
      data: {
        currentEnrolled: {
          increment: 1,
        },
      },
    });

    return newEnrollment;
  });

  return enrollment;
};

/**
 * Get all enrollments for a user
 */
const getUserEnrollments = async (userId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: {
      batch: {
        include: {
          course: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return enrollments;
};

/**
 * Get all enrollments for a batch (Admin/Instructor only)
 */
const getBatchEnrollments = async (batchId) => {
  const enrollments = await prisma.enrollment.findMany({
    where: { batchId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return enrollments;
};

/**
 * Update enrollment status (Admin/Instructor only)
 */
const updateEnrollmentStatus = async (enrollmentId, status) => {
  const validStatuses = ['PENDING', 'CONFIRMED'];
  if (!validStatuses.includes(status)) {
    throw new ApiError(400, 'Invalid status. Must be PENDING or CONFIRMED');
  }

  const enrollment = await prisma.enrollment.update({
    where: { id: enrollmentId },
    data: { status },
    include: {
      batch: {
        include: {
          course: true,
        },
      },
      user: {
        select: {
          id: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return enrollment;
};

/**
 * Cancel enrollment (Student can cancel their own, Admin can cancel any)
 */
const cancelEnrollment = async (enrollmentId, requestUserId, userRole) => {
  const enrollment = await prisma.enrollment.findUnique({
    where: { id: enrollmentId },
  });

  if (!enrollment) {
    throw new ApiError(404, 'Enrollment not found');
  }

  // Check permission: User can only cancel their own enrollment unless they're an admin
  if (userRole !== 'ADMIN' && enrollment.userId !== requestUserId) {
    throw new ApiError(403, 'You can only cancel your own enrollments');
  }

  // Use transaction to ensure consistency
  await prisma.$transaction(async (tx) => {
    // Delete the enrollment
    await tx.enrollment.delete({
      where: { id: enrollmentId },
    });

    // Decrement currentEnrolled
    await tx.batch.update({
      where: { id: enrollment.batchId },
      data: {
        currentEnrolled: {
          decrement: 1,
        },
      },
    });
  });

  return { message: 'Enrollment cancelled successfully' };
};

module.exports = {
  createEnrollment,
  getUserEnrollments,
  getBatchEnrollments,
  updateEnrollmentStatus,
  cancelEnrollment,
};
