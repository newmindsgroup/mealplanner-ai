// Authentication Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const config = require('../config/config');
const { query, queryOne, transaction } = require('../config/database');
const { validate, schemas } = require('../middleware/validation');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken, hashToken } = require('../utils/encryption');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generate JWT access token
 */
function generateAccessToken(userId) {
  return jwt.sign({ userId }, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  });
}

/**
 * Generate refresh token
 */
async function generateRefreshToken(userId) {
  const token = generateToken(64);
  const tokenId = uuidv4();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

  await query(
    'INSERT INTO refresh_tokens (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)',
    [tokenId, userId, token, expiresAt]
  );

  return token;
}

/**
 * Create user response object
 */
function createUserResponse(user) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: Boolean(user.email_verified),
    createdAt: user.created_at,
    lastLogin: user.last_login,
  };
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(schemas.register), asyncHandler(async (req, res) => {
  const { email, password, name } = req.body;

  // Check if user already exists
  const existingUser = await queryOne(
    'SELECT id FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  if (existingUser) {
    return res.status(409).json({
      success: false,
      error: 'Email already registered',
    });
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  // Create user with transaction
  const result = await transaction(async (conn) => {
    const userId = uuidv4();
    const now = new Date();

    // Insert user
    await conn.execute(
      `INSERT INTO users (id, email, password_hash, name, email_verified, created_at, updated_at)
       VALUES (?, ?, ?, ?, FALSE, ?, ?)`,
      [userId, email.toLowerCase(), passwordHash, name, now, now]
    );

    // Create user profile
    await conn.execute(
      `INSERT INTO user_profiles (user_id, preferences, settings, onboarding_complete)
       VALUES (?, '{}', '{}', FALSE)`,
      [userId]
    );

    // Create user progress
    await conn.execute(
      `INSERT INTO user_progress (user_id, level, xp, xp_to_next_level)
       VALUES (?, 1, 0, 100)`,
      [userId]
    );

    // Create default pantry settings
    await conn.execute(
      `INSERT INTO pantry_settings (user_id, settings)
       VALUES (?, '{}')`,
      [userId]
    );

    return userId;
  });

  // Get created user
  const user = await queryOne(
    'SELECT * FROM users WHERE id = ?',
    [result]
  );

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    data: {
      user: createUserResponse(user),
      token: accessToken,
      refreshToken,
    },
  });
}));

/**
 * POST /api/auth/login
 * Authenticate user
 */
router.post('/login', validate(schemas.login), asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Get user
  const user = await queryOne(
    'SELECT * FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user.id);
  const refreshToken = await generateRefreshToken(user.id);

  // Update last login
  await query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: createUserResponse(user),
      token: accessToken,
      refreshToken,
    },
  });
}));

/**
 * POST /api/auth/refresh
 * Refresh access token
 */
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({
      success: false,
      error: 'Refresh token required',
    });
  }

  // Get token from database
  const tokenRecord = await queryOne(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > NOW()',
    [refreshToken]
  );

  if (!tokenRecord) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired refresh token',
    });
  }

  // Get user
  const user = await queryOne(
    'SELECT * FROM users WHERE id = ?',
    [tokenRecord.user_id]
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      error: 'User not found',
    });
  }

  // Generate new tokens
  const accessToken = generateAccessToken(user.id);
  const newRefreshToken = await generateRefreshToken(user.id);

  // Delete old refresh token
  await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);

  res.json({
    success: true,
    data: {
      user: createUserResponse(user),
      token: accessToken,
      refreshToken: newRefreshToken,
    },
  });
}));

/**
 * POST /api/auth/logout
 * Logout user (invalidate refresh token)
 */
router.post('/logout', authenticateToken, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    await query('DELETE FROM refresh_tokens WHERE token = ?', [refreshToken]);
  }

  // Clean up expired tokens for this user
  await query(
    'DELETE FROM refresh_tokens WHERE user_id = ? AND expires_at < NOW()',
    [req.userId]
  );

  res.json({
    success: true,
    message: 'Logout successful',
  });
}));

/**
 * POST /api/auth/forgot-password
 * Request password reset
 */
router.post('/forgot-password', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email required',
    });
  }

  const user = await queryOne(
    'SELECT id, email, name FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  // Always return success to prevent email enumeration
  if (!user) {
    return res.json({
      success: true,
      message: 'If an account exists, a password reset email will be sent',
    });
  }

  // Generate reset token
  const resetToken = generateToken(32);
  const hashedToken = hashToken(resetToken);
  const expiresAt = new Date(Date.now() + config.passwordResetExpiry);

  // Save token
  await query(
    'UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?',
    [hashedToken, expiresAt, user.id]
  );

  // TODO: Send email with reset link
  // For now, log the token (in production, send email)
  if (config.nodeEnv === 'development') {
    console.log('Password reset token:', resetToken);
  }

  res.json({
    success: true,
    message: 'If an account exists, a password reset email will be sent',
    ...(config.nodeEnv === 'development' && { resetToken }), // Only in dev
  });
}));

/**
 * POST /api/auth/reset-password
 * Reset password with token
 */
router.post('/reset-password', asyncHandler(async (req, res) => {
  const { token, password, confirmPassword } = req.body;

  if (!token || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Token and password required',
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Passwords do not match',
    });
  }

  if (password.length < config.validation.passwordMinLength) {
    return res.status(400).json({
      success: false,
      error: `Password must be at least ${config.validation.passwordMinLength} characters`,
    });
  }

  // Hash token
  const hashedToken = hashToken(token);

  // Find user with valid token
  const user = await queryOne(
    'SELECT id FROM users WHERE password_reset_token = ? AND password_reset_expires > NOW()',
    [hashedToken]
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid or expired reset token',
    });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

  // Update password and clear reset token
  await query(
    'UPDATE users SET password_hash = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?',
    [passwordHash, user.id]
  );

  // Invalidate all refresh tokens
  await query('DELETE FROM refresh_tokens WHERE user_id = ?', [user.id]);

  res.json({
    success: true,
    message: 'Password reset successful',
  });
}));

/**
 * POST /api/auth/verify-email
 * Verify email address
 */
router.post('/verify-email', asyncHandler(async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      error: 'Verification token required',
    });
  }

  // Find user with token
  const user = await queryOne(
    'SELECT id FROM users WHERE email_verification_token = ?',
    [token]
  );

  if (!user) {
    return res.status(400).json({
      success: false,
      error: 'Invalid verification token',
    });
  }

  // Mark email as verified
  await query(
    'UPDATE users SET email_verified = TRUE, email_verification_token = NULL WHERE id = ?',
    [user.id]
  );

  res.json({
    success: true,
    message: 'Email verified successfully',
  });
}));

/**
 * GET /api/auth/me
 * Get current user (test endpoint)
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: createUserResponse(req.user),
    },
  });
}));

module.exports = router;

