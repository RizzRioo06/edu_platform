const express = require('express');
const adminController = require('../controllers/adminController');
const { authenticateToken, requireRole } = require('../middlewares/auth');

const router = express.Router();

// All admin routes require authentication and ADMIN role
router.use(authenticateToken);
router.use(requireRole(['ADMIN']));

/**
 * @route   GET /api/admin/stats/overview
 * @desc    Get dashboard overview statistics
 * @access  Admin only
 */
router.get('/stats/overview', adminController.getOverviewStats);

/**
 * @route   GET /api/admin/stats/academic-performance
 * @desc    Get academic performance data over time
 * @access  Admin only
 */
router.get('/stats/academic-performance', adminController.getAcademicPerformance);

/**
 * @route   GET /api/admin/stats/earnings
 * @desc    Get earnings statistics (revenue vs expenses)
 * @access  Admin only
 */
router.get('/stats/earnings', adminController.getEarningsStats);

/**
 * @route   GET /api/admin/stats/students-distribution
 * @desc    Get student distribution by year
 * @access  Admin only
 */
router.get('/stats/students-distribution', adminController.getStudentsDistribution);

/**
 * @route   GET /api/admin/stats/course-sales
 * @desc    Get course sales statistics
 * @access  Admin only
 */
router.get('/stats/course-sales', adminController.getCourseSales);

/**
 * @route   GET /api/admin/messages
 * @desc    Get recent messages
 * @access  Admin only
 */
router.get('/messages', adminController.getRecentMessages);

/**
 * @route   GET /api/admin/activities
 * @desc    Get recent student activities
 * @access  Admin only
 */
router.get('/activities', adminController.getRecentActivities);

module.exports = router;
