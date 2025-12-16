const prisma = require('../utils/prisma');

/**
 * Get dashboard overview statistics
 * @route GET /api/admin/stats/overview
 */
const getOverviewStats = async (req, res, next) => {
  try {
    // Get total counts
    const [totalStudents, totalInstructors, totalCourses, totalAwards] = await Promise.all([
      prisma.user.count({ where: { role: 'STUDENT' } }),
      prisma.user.count({ where: { role: 'INSTRUCTOR' } }),
      prisma.course.count(),
      prisma.award.count(),
    ]);

    // Get total revenue (completed transactions)
    const revenueData = await prisma.transaction.aggregate({
      where: {
        type: 'REVENUE',
        status: 'COMPLETED',
      },
      _sum: {
        amount: true,
      },
    });

    const totalRevenue = revenueData._sum.amount || 0;

    res.json({
      success: true,
      data: {
        totalStudents,
        totalInstructors,
        totalCourses,
        totalAwards,
        totalRevenue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get academic performance data over time
 * @route GET /api/admin/stats/academic-performance
 */
const getAcademicPerformance = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    // Get enrollment data grouped by month
    const enrollments = await prisma.enrollment.findMany({
      where: {
        createdAt: {
          gte: startDate ? new Date(startDate) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // Default: last year
          lte: endDate ? new Date(endDate) : new Date(),
        },
      },
      select: {
        progress: true,
        createdAt: true,
      },
    });

    // Group by month and calculate average progress
    const performanceByMonth = enrollments.reduce((acc, enrollment) => {
      const month = enrollment.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { total: 0, count: 0 };
      }
      acc[month].total += enrollment.progress;
      acc[month].count += 1;
      return acc;
    }, {});

    const performance = Object.entries(performanceByMonth).map(([month, data]) => ({
      month,
      averageProgress: data.total / data.count,
    }));

    res.json({
      success: true,
      data: performance,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get earnings data (revenue vs expenses)
 * @route GET /api/admin/stats/earnings
 */
const getEarningsStats = async (req, res, next) => {
  try {
    const { period = 'month' } = req.query;

    // Get transactions grouped by month
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000), // Last 6 months
        },
      },
      select: {
        amount: true,
        type: true,
        createdAt: true,
      },
    });

    // Group by month
    const earningsByMonth = transactions.reduce((acc, transaction) => {
      const month = transaction.createdAt.toISOString().slice(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = { revenue: 0, expenses: 0 };
      }
      if (transaction.type === 'REVENUE') {
        acc[month].revenue += transaction.amount;
      } else if (transaction.type === 'EXPENSE') {
        acc[month].expenses += transaction.amount;
      }
      return acc;
    }, {});

    const earnings = Object.entries(earningsByMonth).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses,
    }));

    res.json({
      success: true,
      data: earnings,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get student distribution by year
 * @route GET /api/admin/stats/students-distribution
 */
const getStudentsDistribution = async (req, res, next) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        createdAt: true,
      },
    });

    // Group by year
    const distributionByYear = students.reduce((acc, student) => {
      const year = student.createdAt.getFullYear();
      acc[year] = (acc[year] || 0) + 1;
      return acc;
    }, {});

    const distribution = Object.entries(distributionByYear).map(([year, count]) => ({
      year: parseInt(year),
      count,
      percentage: (count / students.length) * 100,
    }));

    res.json({
      success: true,
      data: {
        total: students.length,
        distribution,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent messages
 * @route GET /api/admin/messages
 */
const getRecentMessages = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const messages = await prisma.message.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recent student activities
 * @route GET /api/admin/activities
 */
const getRecentActivities = async (req, res, next) => {
  try {
    const { limit = 10 } = req.query;

    const activities = await prisma.activity.findMany({
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: activities,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get course sales statistics
 * @route GET /api/admin/stats/course-sales
 */
const getCourseSales = async (req, res, next) => {
  try {
    const courses = await prisma.course.findMany({
      include: {
        transactions: {
          where: {
            type: 'REVENUE',
            status: 'COMPLETED',
          },
        },
        batches: {
          include: {
            enrollments: true,
          },
        },
      },
    });

    const salesData = courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      price: course.price,
      totalSales: course.transactions.length,
      totalRevenue: course.transactions.reduce((sum, t) => sum + t.amount, 0),
      totalStudents: course.batches.reduce((sum, b) => sum + b.enrollments.length, 0),
      status: course.isActive ? 'Active' : 'Inactive',
    }));

    res.json({
      success: true,
      data: salesData,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewStats,
  getAcademicPerformance,
  getEarningsStats,
  getStudentsDistribution,
  getRecentMessages,
  getRecentActivities,
  getCourseSales,
};
