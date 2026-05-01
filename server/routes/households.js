// Household Management Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, queryOne, transaction } = require('../config/database');
const { authenticateToken, requireHouseholdAccess, requireHouseholdAdmin } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateToken } = require('../utils/encryption');

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function generateInviteCode() {
  return generateToken(8).toUpperCase();
}

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/households
 * Get all households for current user
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const households = await query(
    `SELECT h.*, hm.role, hm.joined_at,
     (SELECT COUNT(*) FROM household_members WHERE household_id = h.id) as member_count
     FROM households h
     JOIN household_members hm ON h.id = hm.household_id
     WHERE hm.user_id = ?
     ORDER BY h.created_at DESC`,
    [req.userId]
  );

  res.json({
    success: true,
    data: households.map(h => ({
      id: h.id,
      name: h.name,
      ownerId: h.owner_id,
      role: h.role,
      memberCount: h.member_count,
      joinedAt: h.joined_at,
      createdAt: h.created_at,
    })),
  });
}));

/**
 * POST /api/households
 * Create a new household
 */
router.post('/', authenticateToken, validate(schemas.createHousehold), asyncHandler(async (req, res) => {
  const { name } = req.body;

  const householdId = await transaction(async (conn) => {
    const id = uuidv4();
    const inviteCode = generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    // Create household
    await conn.execute(
      'INSERT INTO households (id, name, owner_id, invite_code, invite_code_expires) VALUES (?, ?, ?, ?, ?)',
      [id, name, req.userId, inviteCode, expiresAt]
    );

    // Add creator as owner
    await conn.execute(
      'INSERT INTO household_members (id, household_id, user_id, role) VALUES (?, ?, ?, ?)',
      [uuidv4(), id, req.userId, 'owner']
    );

    return id;
  });

  // Get created household
  const household = await queryOne(
    'SELECT * FROM households WHERE id = ?',
    [householdId]
  );

  res.status(201).json({
    success: true,
    message: 'Household created successfully',
    data: {
      id: household.id,
      name: household.name,
      ownerId: household.owner_id,
      inviteCode: household.invite_code,
      inviteCodeExpires: household.invite_code_expires,
      createdAt: household.created_at,
    },
  });
}));

/**
 * GET /api/households/:id
 * Get household details
 */
router.get('/:id', authenticateToken, requireHouseholdAccess, asyncHandler(async (req, res) => {
  const household = await queryOne(
    'SELECT * FROM households WHERE id = ?',
    [req.params.id]
  );

  // Get members
  const members = await query(
    `SELECT u.id, u.name, u.email, hm.role, hm.joined_at
     FROM household_members hm
     JOIN users u ON hm.user_id = u.id
     WHERE hm.household_id = ?
     ORDER BY hm.joined_at ASC`,
    [req.params.id]
  );

  // Get people (family members)
  const people = await query(
    'SELECT id, name, blood_type, age FROM people WHERE household_id = ?',
    [req.params.id]
  );

  res.json({
    success: true,
    data: {
      id: household.id,
      name: household.name,
      ownerId: household.owner_id,
      inviteCode: household.invite_code,
      inviteCodeExpires: household.invite_code_expires,
      members: members.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        joinedAt: m.joined_at,
      })),
      people: people.map(p => ({
        id: p.id,
        name: p.name,
        bloodType: p.blood_type,
        age: p.age,
      })),
      createdAt: household.created_at,
    },
  });
}));

/**
 * PATCH /api/households/:id
 * Update household
 */
router.patch('/:id', authenticateToken, requireHouseholdAccess, requireHouseholdAdmin, asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({
      success: false,
      error: 'Name required',
    });
  }

  await query(
    'UPDATE households SET name = ?, updated_at = NOW() WHERE id = ?',
    [name, req.params.id]
  );

  const household = await queryOne(
    'SELECT * FROM households WHERE id = ?',
    [req.params.id]
  );

  res.json({
    success: true,
    message: 'Household updated successfully',
    data: {
      id: household.id,
      name: household.name,
      ownerId: household.owner_id,
    },
  });
}));

/**
 * DELETE /api/households/:id
 * Delete household (owner only)
 */
router.delete('/:id', authenticateToken, requireHouseholdAccess, asyncHandler(async (req, res) => {
  // Check if user is owner
  const household = await queryOne(
    'SELECT owner_id FROM households WHERE id = ?',
    [req.params.id]
  );

  if (household.owner_id !== req.userId) {
    return res.status(403).json({
      success: false,
      error: 'Only the owner can delete a household',
    });
  }

  // Delete household (CASCADE will handle members and related data)
  await query('DELETE FROM households WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Household deleted successfully',
  });
}));

/**
 * POST /api/households/:id/invite
 * Generate new invite code
 */
router.post('/:id/invite', authenticateToken, requireHouseholdAccess, requireHouseholdAdmin, asyncHandler(async (req, res) => {
  const inviteCode = generateInviteCode();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await query(
    'UPDATE households SET invite_code = ?, invite_code_expires = ? WHERE id = ?',
    [inviteCode, expiresAt, req.params.id]
  );

  res.json({
    success: true,
    message: 'Invite code generated',
    data: {
      inviteCode,
      expiresAt,
    },
  });
}));

/**
 * POST /api/households/join/:code
 * Join household via invite code
 */
router.post('/join/:code', authenticateToken, asyncHandler(async (req, res) => {
  const { code } = req.params;

  // Find household with valid invite code
  const household = await queryOne(
    'SELECT * FROM households WHERE invite_code = ? AND invite_code_expires > NOW()',
    [code.toUpperCase()]
  );

  if (!household) {
    return res.status(404).json({
      success: false,
      error: 'Invalid or expired invite code',
    });
  }

  // Check if already a member
  const existingMember = await queryOne(
    'SELECT id FROM household_members WHERE household_id = ? AND user_id = ?',
    [household.id, req.userId]
  );

  if (existingMember) {
    return res.status(409).json({
      success: false,
      error: 'Already a member of this household',
    });
  }

  // Add member
  await query(
    'INSERT INTO household_members (id, household_id, user_id, role) VALUES (?, ?, ?, ?)',
    [uuidv4(), household.id, req.userId, 'member']
  );

  res.json({
    success: true,
    message: 'Joined household successfully',
    data: {
      householdId: household.id,
      householdName: household.name,
    },
  });
}));

/**
 * DELETE /api/households/:id/members/:userId
 * Remove member from household
 */
router.delete('/:id/members/:userId', authenticateToken, requireHouseholdAccess, requireHouseholdAdmin, asyncHandler(async (req, res) => {
  const { id, userId } = req.params;

  // Cannot remove owner
  const household = await queryOne(
    'SELECT owner_id FROM households WHERE id = ?',
    [id]
  );

  if (household.owner_id === userId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot remove the household owner',
    });
  }

  // Remove member
  await query(
    'DELETE FROM household_members WHERE household_id = ? AND user_id = ?',
    [id, userId]
  );

  res.json({
    success: true,
    message: 'Member removed successfully',
  });
}));

/**
 * POST /api/households/:id/leave
 * Leave household
 */
router.post('/:id/leave', authenticateToken, requireHouseholdAccess, asyncHandler(async (req, res) => {
  // Check if user is owner
  const household = await queryOne(
    'SELECT owner_id FROM households WHERE id = ?',
    [req.params.id]
  );

  if (household.owner_id === req.userId) {
    return res.status(400).json({
      success: false,
      error: 'Owner cannot leave. Delete the household or transfer ownership first.',
    });
  }

  // Remove from household
  await query(
    'DELETE FROM household_members WHERE household_id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  res.json({
    success: true,
    message: 'Left household successfully',
  });
}));

/**
 * PATCH /api/households/:id/members/:userId/role
 * Update member role
 */
router.patch('/:id/members/:userId/role', authenticateToken, requireHouseholdAccess, requireHouseholdAdmin, asyncHandler(async (req, res) => {
  const { id, userId } = req.params;
  const { role } = req.body;

  if (!['member', 'admin'].includes(role)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid role. Must be "member" or "admin"',
    });
  }

  // Cannot change owner role
  const household = await queryOne(
    'SELECT owner_id FROM households WHERE id = ?',
    [id]
  );

  if (household.owner_id === userId) {
    return res.status(400).json({
      success: false,
      error: 'Cannot change owner role',
    });
  }

  await query(
    'UPDATE household_members SET role = ? WHERE household_id = ? AND user_id = ?',
    [role, id, userId]
  );

  res.json({
    success: true,
    message: 'Member role updated successfully',
  });
}));

module.exports = router;

