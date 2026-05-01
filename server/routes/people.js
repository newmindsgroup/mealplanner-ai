// People (Family Members) Management Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, queryOne } = require('../config/database');
const { authenticateToken, requireHouseholdAccess } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');

// ============================================================================
// ROUTES
// ============================================================================

/**
 * GET /api/people
 * Get all family members for current user
 */
router.get('/', authenticateToken, asyncHandler(async (req, res) => {
  const { householdId } = req.query;

  let people;
  if (householdId) {
    // Get people for specific household (if user has access)
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

    people = await query(
      'SELECT * FROM people WHERE household_id = ? ORDER BY created_at DESC',
      [householdId]
    );
  } else {
    // Get all people for user
    people = await query(
      'SELECT * FROM people WHERE user_id = ? ORDER BY created_at DESC',
      [req.userId]
    );
  }

  res.json({
    success: true,
    data: people.map(p => ({
      id: p.id,
      userId: p.user_id,
      householdId: p.household_id,
      name: p.name,
      bloodType: p.blood_type,
      age: p.age,
      allergies: p.allergies ? JSON.parse(p.allergies) : [],
      goals: p.goals ? JSON.parse(p.goals) : [],
      dietaryRestrictions: p.dietary_restrictions ? JSON.parse(p.dietary_restrictions) : [],
      healthConditions: p.health_conditions ? JSON.parse(p.health_conditions) : [],
      createdAt: p.created_at,
      updatedAt: p.updated_at,
    })),
  });
}));

/**
 * POST /api/people
 * Create a new family member
 */
router.post('/', authenticateToken, validate(schemas.createPerson), asyncHandler(async (req, res) => {
  const {
    name,
    bloodType,
    age,
    allergies,
    goals,
    dietaryRestrictions,
    healthConditions,
    householdId,
  } = req.body;

  // If householdId provided, verify access
  if (householdId) {
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
  }

  const personId = uuidv4();

  await query(
    `INSERT INTO people (
      id, user_id, household_id, name, blood_type, age,
      allergies, goals, dietary_restrictions, health_conditions
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      personId,
      req.userId,
      householdId || null,
      name,
      bloodType || null,
      age || null,
      JSON.stringify(allergies || []),
      JSON.stringify(goals || []),
      JSON.stringify(dietaryRestrictions || []),
      JSON.stringify(healthConditions || []),
    ]
  );

  const person = await queryOne('SELECT * FROM people WHERE id = ?', [personId]);

  res.status(201).json({
    success: true,
    message: 'Family member added successfully',
    data: {
      id: person.id,
      userId: person.user_id,
      householdId: person.household_id,
      name: person.name,
      bloodType: person.blood_type,
      age: person.age,
      allergies: person.allergies ? JSON.parse(person.allergies) : [],
      goals: person.goals ? JSON.parse(person.goals) : [],
      dietaryRestrictions: person.dietary_restrictions ? JSON.parse(person.dietary_restrictions) : [],
      healthConditions: person.health_conditions ? JSON.parse(person.health_conditions) : [],
      createdAt: person.created_at,
    },
  });
}));

/**
 * GET /api/people/:id
 * Get specific family member
 */
router.get('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const person = await queryOne(
    'SELECT * FROM people WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!person) {
    return res.status(404).json({
      success: false,
      error: 'Family member not found',
    });
  }

  res.json({
    success: true,
    data: {
      id: person.id,
      userId: person.user_id,
      householdId: person.household_id,
      name: person.name,
      bloodType: person.blood_type,
      age: person.age,
      allergies: person.allergies ? JSON.parse(person.allergies) : [],
      goals: person.goals ? JSON.parse(person.goals) : [],
      dietaryRestrictions: person.dietary_restrictions ? JSON.parse(person.dietary_restrictions) : [],
      healthConditions: person.health_conditions ? JSON.parse(person.health_conditions) : [],
      createdAt: person.created_at,
      updatedAt: person.updated_at,
    },
  });
}));

/**
 * PATCH /api/people/:id
 * Update family member
 */
router.patch('/:id', authenticateToken, asyncHandler(async (req, res) => {
  const {
    name,
    bloodType,
    age,
    allergies,
    goals,
    dietaryRestrictions,
    healthConditions,
  } = req.body;

  // Verify ownership
  const person = await queryOne(
    'SELECT * FROM people WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!person) {
    return res.status(404).json({
      success: false,
      error: 'Family member not found',
    });
  }

  // Build update
  const updates = {};
  if (name !== undefined) updates.name = name;
  if (bloodType !== undefined) updates.blood_type = bloodType;
  if (age !== undefined) updates.age = age;
  if (allergies !== undefined) updates.allergies = JSON.stringify(allergies);
  if (goals !== undefined) updates.goals = JSON.stringify(goals);
  if (dietaryRestrictions !== undefined) updates.dietary_restrictions = JSON.stringify(dietaryRestrictions);
  if (healthConditions !== undefined) updates.health_conditions = JSON.stringify(healthConditions);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: 'No updates provided',
    });
  }

  const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(updates), req.params.id];

  await query(
    `UPDATE people SET ${setClause}, updated_at = NOW() WHERE id = ?`,
    values
  );

  const updated = await queryOne('SELECT * FROM people WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Family member updated successfully',
    data: {
      id: updated.id,
      userId: updated.user_id,
      householdId: updated.household_id,
      name: updated.name,
      bloodType: updated.blood_type,
      age: updated.age,
      allergies: updated.allergies ? JSON.parse(updated.allergies) : [],
      goals: updated.goals ? JSON.parse(updated.goals) : [],
      dietaryRestrictions: updated.dietary_restrictions ? JSON.parse(updated.dietary_restrictions) : [],
      healthConditions: updated.health_conditions ? JSON.parse(updated.health_conditions) : [],
      updatedAt: updated.updated_at,
    },
  });
}));

/**
 * DELETE /api/people/:id
 * Delete family member
 */
router.delete('/:id', authenticateToken, asyncHandler(async (req, res) => {
  // Verify ownership
  const person = await queryOne(
    'SELECT id FROM people WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!person) {
    return res.status(404).json({
      success: false,
      error: 'Family member not found',
    });
  }

  await query('DELETE FROM people WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Family member deleted successfully',
  });
}));

module.exports = router;

