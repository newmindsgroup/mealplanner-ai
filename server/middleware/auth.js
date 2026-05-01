// Authentication Middleware
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const { queryOne } = require('../config/database');

/**
 * Verify JWT token and attach user to request
 */
async function authenticateToken(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
      });
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get user from database
    const user = await queryOne(
      'SELECT id, email, name, email_verified FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    // Attach user to request
    req.user = user;
    req.userId = user.id;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Invalid token',
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired',
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Optional authentication - attaches user if token is valid, but doesn't require it
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, config.jwt.secret);
      const user = await queryOne(
        'SELECT id, email, name, email_verified FROM users WHERE id = ?',
        [decoded.userId]
      );

      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    }

    next();
  } catch (error) {
    // Silently fail for optional auth
    next();
  }
}

/**
 * Require email verification
 */
function requireEmailVerification(req, res, next) {
  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      error: 'Email verification required',
    });
  }
  next();
}

/**
 * Check if user has access to a household
 */
async function requireHouseholdAccess(req, res, next) {
  try {
    const householdId = req.params.householdId || req.params.id;

    if (!householdId) {
      return res.status(400).json({
        success: false,
        error: 'Household ID required',
      });
    }

    // Check if user is member of household
    const member = await queryOne(
      'SELECT role FROM household_members WHERE household_id = ? AND user_id = ?',
      [householdId, req.userId]
    );

    if (!member) {
      return res.status(403).json({
        success: false,
        error: 'Access denied to this household',
      });
    }

    req.householdRole = member.role;
    next();
  } catch (error) {
    console.error('Household access check error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization error',
    });
  }
}

/**
 * Require household admin or owner role
 */
function requireHouseholdAdmin(req, res, next) {
  if (!['owner', 'admin'].includes(req.householdRole)) {
    return res.status(403).json({
      success: false,
      error: 'Admin access required',
    });
  }
  next();
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireEmailVerification,
  requireHouseholdAccess,
  requireHouseholdAdmin,
};

