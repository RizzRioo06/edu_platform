const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const ApiError = require('../utils/ApiError');

/**
 * Register a new user
 */
const register = async (email, password, role = 'STUDENT') => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new ApiError(409, 'User with this email already exists');
  }

  // Validate role
  const validRoles = ['STUDENT', 'ADMIN', 'INSTRUCTOR'];
  if (!validRoles.includes(role)) {
    throw new ApiError(400, 'Invalid role specified');
  }

  // Hash password
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password_hash,
      role,
    },
    select: {
      id: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });

  return user;
};

/**
 * Login user and generate JWT token
 */
const login = async (email, password) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Check if user registered with Google
  if (user.provider === 'google' && !user.password_hash) {
    throw new ApiError(401, 'Please login with Google');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate JWT token
  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    }
  );

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      provider: user.provider,
    },
    token,
  };
};

/**
 * Logout user by blacklisting the token
 */
const logout = async (token) => {
  try {
    // Decode token to get expiration
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const expiresAt = new Date(decoded.exp * 1000);

    // Add token to blacklist
    await prisma.tokenBlacklist.create({
      data: {
        token,
        expiresAt,
      },
    });

    return { message: 'Logged out successfully' };
  } catch (error) {
    throw new ApiError(400, 'Invalid token');
  }
};

/**
 * Check if token is blacklisted
 */
const isTokenBlacklisted = async (token) => {
  const blacklistedToken = await prisma.tokenBlacklist.findUnique({
    where: { token },
  });

  return !!blacklistedToken;
};

/**
 * Delete user account
 */
const deleteAccount = async (userId, password = null) => {
  // Get user
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // If local user, verify password before deletion
  if (user.provider === 'local' && password) {
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      throw new ApiError(401, 'Invalid password');
    }
  }

  // Delete user (cascades to enrollments due to Prisma schema)
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: 'Account deleted successfully' };
};

/**
 * Clean up expired tokens from blacklist (maintenance function)
 */
const cleanExpiredTokens = async () => {
  await prisma.tokenBlacklist.deleteMany({
    where: {
      expiresAt: {
        lt: new Date(),
      },
    },
  });
};

module.exports = {
  register,
  login,
  logout,
  isTokenBlacklisted,
  deleteAccount,
  cleanExpiredTokens,
};
