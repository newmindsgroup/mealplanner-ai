// Grocery List Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, queryOne } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * GET /api/grocery/lists
 * Get all grocery lists
 */
router.get('/lists', authenticateToken, asyncHandler(async (req, res) => {
  const { householdId } = req.query;

  let sql = 'SELECT * FROM grocery_lists WHERE user_id = ?';
  const params = [req.userId];

  if (householdId) {
    sql += ' AND household_id = ?';
    params.push(householdId);
  }

  sql += ' ORDER BY created_at DESC';

  const lists = await query(sql, params);

  res.json({
    success: true,
    data: lists.map(l => ({
      id: l.id,
      userId: l.user_id,
      householdId: l.household_id,
      name: l.name,
      listData: JSON.parse(l.list_data),
      mealPlanId: l.meal_plan_id,
      completed: Boolean(l.completed),
      createdAt: l.created_at,
      updatedAt: l.updated_at,
    })),
  });
}));

/**
 * POST /api/grocery/lists
 * Create grocery list
 */
router.post('/lists', authenticateToken, asyncHandler(async (req, res) => {
  const { name, listData, mealPlanId, householdId } = req.body;

  if (!name || !listData) {
    return res.status(400).json({
      success: false,
      error: 'Name and list data required',
    });
  }

  const listId = uuidv4();

  await query(
    'INSERT INTO grocery_lists (id, user_id, household_id, name, list_data, meal_plan_id) VALUES (?, ?, ?, ?, ?, ?)',
    [listId, req.userId, householdId || null, name, JSON.stringify(listData), mealPlanId || null]
  );

  const list = await queryOne('SELECT * FROM grocery_lists WHERE id = ?', [listId]);

  res.status(201).json({
    success: true,
    message: 'Grocery list created successfully',
    data: {
      id: list.id,
      name: list.name,
      listData: JSON.parse(list.list_data),
      createdAt: list.created_at,
    },
  });
}));

/**
 * GET /api/grocery/lists/:id
 * Get specific grocery list
 */
router.get('/lists/:id', authenticateToken, asyncHandler(async (req, res) => {
  const list = await queryOne(
    'SELECT * FROM grocery_lists WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!list) {
    return res.status(404).json({
      success: false,
      error: 'Grocery list not found',
    });
  }

  res.json({
    success: true,
    data: {
      id: list.id,
      name: list.name,
      listData: JSON.parse(list.list_data),
      mealPlanId: list.meal_plan_id,
      completed: Boolean(list.completed),
      createdAt: list.created_at,
      updatedAt: list.updated_at,
    },
  });
}));

/**
 * PATCH /api/grocery/lists/:id
 * Update grocery list
 */
router.patch('/lists/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { name, listData, completed } = req.body;

  const list = await queryOne(
    'SELECT id FROM grocery_lists WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!list) {
    return res.status(404).json({
      success: false,
      error: 'Grocery list not found',
    });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (listData !== undefined) updates.list_data = JSON.stringify(listData);
  if (completed !== undefined) updates.completed = completed;

  if (Object.keys(updates).length > 0) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    await query(
      `UPDATE grocery_lists SET ${setClause}, updated_at = NOW() WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );
  }

  res.json({
    success: true,
    message: 'Grocery list updated successfully',
  });
}));

/**
 * DELETE /api/grocery/lists/:id
 * Delete grocery list
 */
router.delete('/lists/:id', authenticateToken, asyncHandler(async (req, res) => {
  const list = await queryOne(
    'SELECT id FROM grocery_lists WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!list) {
    return res.status(404).json({
      success: false,
      error: 'Grocery list not found',
    });
  }

  await query('DELETE FROM grocery_lists WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Grocery list deleted successfully',
  });
}));

module.exports = router;

