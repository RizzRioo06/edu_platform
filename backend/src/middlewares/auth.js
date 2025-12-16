const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const authService = require('../services/authService');

/**
 * Middleware to authenticate JWT token
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      throw new ApiError(401, 'Access token is required');
    }

    // Check if token is blacklisted (logged out)
    const isBlacklisted = await authService.isTokenBlacklisted(token);
    if (isBlacklisted) {
      throw new ApiError(401, 'Token has been revoked. Please login again.');
    }

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        throw new ApiError(403, 'Invalid or expired token');
      }

      // Attach user info to request
      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
      };

      // Attach token for logout
      req.token = token;

      next();
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to check if user has specific role(s)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      if (!roles.includes(req.user.role)) {
        throw new ApiError(403, 'You do not have permission to perform this action');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

module.exports = {
  authenticateToken,
  authorize,
};
