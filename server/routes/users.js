// User Profile and Settings Routes
const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');

const config = require('../config/config');
const { query, queryOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { encrypt, decrypt } = require('../utils/encryption');

// ============================================================================
// HELPERS
// ============================================================================

function createUserResponse(user, profile = null, progress = null) {
  const response = {
    id: user.id,
    email: user.email,
    name: user.name,
    emailVerified: Boolean(user.email_verified),
    createdAt: user.created_at,
    lastLogin: user.last_login,
  };

  if (profile) {
    response.profile = {
      preferences: profile.preferences ? JSON.parse(profile.preferences) : {},
      settings: profile.settings ? JSON.parse(profile.settings) : {},
      onboardingComplete: Boolean(profile.onboarding_complete),
    };
  }

  if (progress) {
    response.progress = {
      level: progress.level,
      xp: progress.xp,
      xpToNextLevel: progress.xp_to_next_level,
      streak: progress.streak,
      mealsCompleted: progress.meals_completed,
      badges: progress.badges ? JSON.parse(progress.badges) : [],
      achievements: progress.achievements ? JSON.parse(progress.achievements) : [],
    };
  }

  return response;
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/users/me
 * Get current user profile
 */
router.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  // Get user with profile and progress
  const user = await queryOne(
    'SELECT * FROM users WHERE id = ?',
    [req.userId]
  );

  const profile = await queryOne(
    'SELECT * FROM user_profiles WHERE user_id = ?',
    [req.userId]
  );

  const progress = await queryOne(
    'SELECT * FROM user_progress WHERE user_id = ?',
    [req.userId]
  );

  res.json({
    success: true,
    data: createUserResponse(user, profile, progress),
  });
}));

/**
 * PATCH /api/users/me
 * Update user profile
 */
router.patch('/me', authenticateToken, validate(schemas.updateProfile), asyncHandler(async (req, res) => {
  const { name, email } = req.body;
  const updates = {};

  if (name) updates.name = name;
  if (email && email !== req.user.email) {
    // Check if email already exists
    const existingUser = await queryOne(
      'SELECT id FROM users WHERE email = ? AND id != ?',
      [email.toLowerCase(), req.userId]
    );

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already in use',
      });
    }

    updates.email = email.toLowerCase();
    updates.email_verified = false; // Reset verification
  }

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No updates provided',
    });
  }

  // Build update query
  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), req.userId];

  await query(
    `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    values
  );

  // Get updated user
  const user = await queryOne('SELECT * FROM users WHERE id = ?', [req.userId]);
  const profile = await queryOne('SELECT * FROM user_profiles WHERE user_id = ?', [req.userId]);
  const progress = await queryOne('SELECT * FROM user_progress WHERE user_id = ?', [req.userId]);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: createUserResponse(user, profile, progress),
  });
}));

/**
 * PATCH /api/users/settings
 * Update user settings
 */
router.patch('/settings', authenticateToken, validate(schemas.updateSettings), asyncHandler(async (req, res) => {
  const settings = req.body;

  // Get current profile
  const profile = await queryOne(
    'SELECT settings FROM user_profiles WHERE user_id = ?',
    [req.userId]
  );

  const currentSettings = profile.settings ? JSON.parse(profile.settings) : {};
  const updatedSettings = { ...currentSettings, ...settings };

  // Update settings
  await query(
    'UPDATE user_profiles SET settings = ?, updated_at = NOW() WHERE user_id = ?',
    [JSON.stringify(updatedSettings), req.userId]
  );

  res.json({
    success: true,
    message: 'Settings updated successfully',
    data: { settings: updatedSettings },
  });
}));

/**
 * PATCH /api/users/preferences
 * Update user preferences (meal planning, dietary preferences)
 */
router.patch('/preferences', authenticateToken, asyncHandler(async (req, res) => {
  const preferences = req.body;

  // Get current profile
  const profile = await queryOne(
    'SELECT preferences FROM user_profiles WHERE user_id = ?',
    [req.userId]
  );

  const currentPrefs = profile.preferences ? JSON.parse(profile.preferences) : {};
  const updatedPrefs = { ...currentPrefs, ...preferences };

  // Update preferences
  await query(
    'UPDATE user_profiles SET preferences = ?, updated_at = NOW() WHERE user_id = ?',
    [JSON.stringify(updatedPrefs), req.userId]
  );

  res.json({
    success: true,
    message: 'Preferences updated successfully',
    data: { preferences: updatedPrefs },
  });
}));

/**
 * POST /api/users/complete-onboarding
 * Mark onboarding as complete
 */
router.post('/complete-onboarding', authenticateToken, asyncHandler(async (req, res) => {
  await query(
    'UPDATE user_profiles SET onboarding_complete = TRUE, updated_at = NOW() WHERE user_id = ?',
    [req.userId]
  );

  res.json({
    success: true,
    message: 'Onboarding completed',
  });
}));

/**
 * POST /api/users/api-keys
 * Store user's OpenAI/Anthropic API keys (encrypted)
 */
router.post('/api-keys', authenticateToken, asyncHandler(async (req, res) => {
  const { provider, apiKey } = req.body;

  if (!provider || !apiKey) {
    return res.status(400).json({
      success: false,
      error: 'Provider and API key required',
    });
  }

  if (!['openai', 'anthropic'].includes(provider)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider. Must be "openai" or "anthropic"',
    });
  }

  // Encrypt API key
  const { encrypted, iv } = encrypt(apiKey);

  // Check if key exists
  const existing = await queryOne(
    'SELECT id FROM api_keys WHERE user_id = ? AND provider = ?',
    [req.userId, provider]
  );

  if (existing) {
    // Update existing
    await query(
      'UPDATE api_keys SET encrypted_key = ?, encryption_iv = ?, is_active = TRUE, updated_at = NOW() WHERE id = ?',
      [encrypted, iv, existing.id]
    );
  } else {
    // Insert new
    const { v4: uuidv4 } = require('uuid');
    await query(
      'INSERT INTO api_keys (id, user_id, provider, encrypted_key, encryption_iv, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [uuidv4(), req.userId, provider, encrypted, iv]
    );
  }

  res.json({
    success: true,
    message: 'API key saved successfully',
    data: { provider },
  });
}));

/**
 * DELETE /api/users/api-keys/:provider
 * Delete user's API key
 */
router.delete('/api-keys/:provider', authenticateToken, asyncHandler(async (req, res) => {
  const { provider } = req.params;

  if (!['openai', 'anthropic'].includes(provider)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid provider',
    });
  }

  await query(
    'DELETE FROM api_keys WHERE user_id = ? AND provider = ?',
    [req.userId, provider]
  );

  res.json({
    success: true,
    message: 'API key deleted successfully',
  });
}));

/**
 * GET /api/users/api-keys
 * Get user's API key providers (not the actual keys)
 */
router.get('/api-keys', authenticateToken, asyncHandler(async (req, res) => {
  const keys = await query(
    'SELECT provider, is_active, created_at FROM api_keys WHERE user_id = ?',
    [req.userId]
  );

  res.json({
    success: true,
    data: keys.map(k => ({
      provider: k.provider,
      isActive: Boolean(k.is_active),
      createdAt: k.created_at,
    })),
  });
}));

/**
 * PATCH /api/users/password
 * Change password
 */
router.patch('/password', authenticateToken, asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'All password fields required',
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: 'Passwords do not match',
    });
  }

  if (newPassword.length < config.validation.passwordMinLength) {
    return res.status(400).json({
      success: false,
      error: `Password must be at least ${config.validation.passwordMinLength} characters`,
    });
  }

  // Get user with password
  const user = await queryOne(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.userId]
  );

  // Verify current password
  const isValid = await bcrypt.compare(currentPassword, user.password_hash);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Current password is incorrect',
    });
  }

  // Hash new password
  const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

  // Update password
  await query(
    'UPDATE users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
    [passwordHash, req.userId]
  );

  // Invalidate all refresh tokens except current session
  await query(
    'DELETE FROM refresh_tokens WHERE user_id = ?',
    [req.userId]
  );

  res.json({
    success: true,
    message: 'Password changed successfully',
  });
}));

/**
 * GET /api/users/progress
 * Get user progress/gamification data
 */
router.get('/progress', authenticateToken, asyncHandler(async (req, res) => {
  const progress = await queryOne(
    'SELECT * FROM user_progress WHERE user_id = ?',
    [req.userId]
  );

  if (!progress) {
    return res.status(404).json({
      success: false,
      error: 'Progress not found',
    });
  }

  res.json({
    success: true,
    data: {
      level: progress.level,
      xp: progress.xp,
      xpToNextLevel: progress.xp_to_next_level,
      streak: progress.streak,
      mealsCompleted: progress.meals_completed,
      badges: progress.badges ? JSON.parse(progress.badges) : [],
      weeklyActivity: progress.weekly_activity ? JSON.parse(progress.weekly_activity) : [],
      achievements: progress.achievements ? JSON.parse(progress.achievements) : [],
    },
  });
}));

/**
 * POST /api/users/progress/xp
 * Add XP to user
 */
router.post('/progress/xp', authenticateToken, asyncHandler(async (req, res) => {
  const { amount } = req.body;

  if (!amount || amount < 0) {
    return res.status(400).json({
      success: false,
      error: 'Valid XP amount required',
    });
  }

  // Get current progress
  const progress = await queryOne(
    'SELECT * FROM user_progress WHERE user_id = ?',
    [req.userId]
  );

  let newXp = progress.xp + amount;
  let newLevel = progress.level;
  let xpToNext = progress.xp_to_next_level;

  // Level up logic
  while (newXp >= xpToNext) {
    newXp -= xpToNext;
    newLevel++;
    xpToNext += 50; // Increase XP needed per level
  }

  // Update progress
  await query(
    'UPDATE user_progress SET xp = ?, level = ?, xp_to_next_level = ?, updated_at = NOW() WHERE user_id = ?',
    [newXp, newLevel, xpToNext, req.userId]
  );

  res.json({
    success: true,
    message: 'XP added successfully',
    data: {
      level: newLevel,
      xp: newXp,
      xpToNextLevel: xpToNext,
      leveledUp: newLevel > progress.level,
    },
  });
}));

/**
 * DELETE /api/users/account
 * Delete user account
 */
router.delete('/account', authenticateToken, asyncHandler(async (req, res) => {
  const { password, confirmation } = req.body;

  if (!password || confirmation !== 'DELETE') {
    return res.status(400).json({
      success: false,
      error: 'Password and confirmation required',
    });
  }

  // Verify password
  const user = await queryOne(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.userId]
  );

  const isValid = await bcrypt.compare(password, user.password_hash);

  if (!isValid) {
    return res.status(401).json({
      success: false,
      error: 'Invalid password',
    });
  }

  // Delete user (CASCADE will handle related records)
  await query('DELETE FROM users WHERE id = ?', [req.userId]);

  res.json({
    success: true,
    message: 'Account deleted successfully',
  });
}));

module.exports = router;

