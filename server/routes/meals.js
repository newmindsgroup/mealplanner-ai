// Meal Planning Routes
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, queryOne, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { asyncHandler } = require('../middleware/errorHandler');
const { generateMealPlan } = require('../services/aiService');

// ============================================================================
// MEAL PLANS
// ============================================================================

/**
 * GET /api/meals/plans
 * Get all meal plans for current user
 */
router.get('/plans', authenticateToken, asyncHandler(async (req, res) => {
  const { householdId, limit = 20 } = req.query;

  let plans;
  if (householdId) {
    plans = await query(
      `SELECT * FROM meal_plans
       WHERE user_id = ? AND household_id = ?
       ORDER BY week_start DESC
       LIMIT ?`,
      [req.userId, householdId, parseInt(limit)]
    );
  } else {
    plans = await query(
      `SELECT * FROM meal_plans
       WHERE user_id = ?
       ORDER BY week_start DESC
       LIMIT ?`,
      [req.userId, parseInt(limit)]
    );
  }

  res.json({
    success: true,
    data: plans.map(p => ({
      id: p.id,
      userId: p.user_id,
      householdId: p.household_id,
      weekStart: p.week_start,
      weekEnd: p.week_end,
      planData: JSON.parse(p.plan_data),
      peopleIds: p.people_ids ? JSON.parse(p.people_ids) : [],
      preferences: p.preferences ? JSON.parse(p.preferences) : {},
      createdAt: p.created_at,
    })),
  });
}));

/**
 * POST /api/meals/plans
 * Generate new meal plan
 */
router.post('/plans', authenticateToken, validate(schemas.createMealPlan), asyncHandler(async (req, res) => {
  const { weekStart, peopleIds, preferences, householdId } = req.body;

  // Get people details
  const placeholders = peopleIds.map(() => '?').join(',');
  const people = await query(
    `SELECT * FROM people WHERE id IN (${placeholders}) AND user_id = ?`,
    [...peopleIds, req.userId]
  );

  if (people.length !== peopleIds.length) {
    return res.status(400).json({
      success: false,
      error: 'Some family members not found',
    });
  }

  // Format people for AI
  const formattedPeople = people.map(p => ({
    name: p.name,
    bloodType: p.blood_type,
    age: p.age,
    allergies: p.allergies ? JSON.parse(p.allergies) : [],
    goals: p.goals ? JSON.parse(p.goals) : [],
    dietaryRestrictions: p.dietary_restrictions ? JSON.parse(p.dietary_restrictions) : [],
  }));

  // Generate meal plan with AI
  const planData = await generateMealPlan(formattedPeople, preferences || {}, req.userId);

  // Calculate week end
  const weekStartDate = new Date(weekStart);
  const weekEndDate = new Date(weekStartDate);
  weekEndDate.setDate(weekEndDate.getDate() + 6);

  // Save plan
  const planId = uuidv4();
  await query(
    `INSERT INTO meal_plans (
      id, user_id, household_id, week_start, week_end,
      plan_data, people_ids, preferences
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      planId,
      req.userId,
      householdId || null,
      weekStartDate,
      weekEndDate,
      JSON.stringify(planData),
      JSON.stringify(peopleIds),
      JSON.stringify(preferences || {}),
    ]
  );

  // Save individual meals
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'];

  for (const day of days) {
    if (planData[day]) {
      for (const mealType of mealTypes) {
        if (planData[day][mealType]) {
          const meal = planData[day][mealType];
          await query(
            `INSERT INTO meals (id, plan_id, day, meal_type, name, recipe, ingredients, rationale)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              uuidv4(),
              planId,
              day,
              mealType,
              meal.name || '',
              JSON.stringify(meal),
              JSON.stringify(meal.ingredients || []),
              planData[day].rationale || null,
            ]
          );
        }
      }
    }
  }

  // Add XP for generating meal plan
  await query(
    'UPDATE user_progress SET xp = xp + 50 WHERE user_id = ?',
    [req.userId]
  );

  res.status(201).json({
    success: true,
    message: 'Meal plan generated successfully',
    data: {
      id: planId,
      weekStart: weekStartDate,
      weekEnd: weekEndDate,
      planData,
      peopleIds,
      preferences,
    },
  });
}));

/**
 * GET /api/meals/plans/:id
 * Get specific meal plan
 */
router.get('/plans/:id', authenticateToken, asyncHandler(async (req, res) => {
  const plan = await queryOne(
    'SELECT * FROM meal_plans WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Meal plan not found',
    });
  }

  // Get meals
  const meals = await query(
    'SELECT * FROM meals WHERE plan_id = ?',
    [req.params.id]
  );

  res.json({
    success: true,
    data: {
      id: plan.id,
      userId: plan.user_id,
      householdId: plan.household_id,
      weekStart: plan.week_start,
      weekEnd: plan.week_end,
      planData: JSON.parse(plan.plan_data),
      peopleIds: plan.people_ids ? JSON.parse(plan.people_ids) : [],
      preferences: plan.preferences ? JSON.parse(plan.preferences) : {},
      meals: meals.map(m => ({
        id: m.id,
        day: m.day,
        mealType: m.meal_type,
        name: m.name,
        recipe: JSON.parse(m.recipe),
        ingredients: JSON.parse(m.ingredients),
        rationale: m.rationale,
      })),
      createdAt: plan.created_at,
    },
  });
}));

/**
 * DELETE /api/meals/plans/:id
 * Delete meal plan
 */
router.delete('/plans/:id', authenticateToken, asyncHandler(async (req, res) => {
  const plan = await queryOne(
    'SELECT id FROM meal_plans WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!plan) {
    return res.status(404).json({
      success: false,
      error: 'Meal plan not found',
    });
  }

  await query('DELETE FROM meal_plans WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Meal plan deleted successfully',
  });
}));

// ============================================================================
// FAVORITES
// ============================================================================

/**
 * GET /api/meals/favorites
 * Get user's favorite meals
 */
router.get('/favorites', authenticateToken, asyncHandler(async (req, res) => {
  const favorites = await query(
    'SELECT * FROM favorite_meals WHERE user_id = ? ORDER BY added_at DESC',
    [req.userId]
  );

  res.json({
    success: true,
    data: favorites.map(f => ({
      id: f.id,
      mealData: JSON.parse(f.meal_data),
      tags: f.tags ? JSON.parse(f.tags) : [],
      notes: f.notes,
      addedAt: f.added_at,
    })),
  });
}));

/**
 * POST /api/meals/favorites
 * Add meal to favorites
 */
router.post('/favorites', authenticateToken, asyncHandler(async (req, res) => {
  const { mealData, tags, notes } = req.body;

  if (!mealData) {
    return res.status(400).json({
      success: false,
      error: 'Meal data required',
    });
  }

  const favoriteId = uuidv4();
  await query(
    'INSERT INTO favorite_meals (id, user_id, meal_data, tags, notes) VALUES (?, ?, ?, ?, ?)',
    [
      favoriteId,
      req.userId,
      JSON.stringify(mealData),
      JSON.stringify(tags || []),
      notes || null,
    ]
  );

  res.status(201).json({
    success: true,
    message: 'Added to favorites',
    data: {
      id: favoriteId,
      mealData,
      tags: tags || [],
      notes,
    },
  });
}));

/**
 * DELETE /api/meals/favorites/:id
 * Remove from favorites
 */
router.delete('/favorites/:id', authenticateToken, asyncHandler(async (req, res) => {
  const favorite = await queryOne(
    'SELECT id FROM favorite_meals WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!favorite) {
    return res.status(404).json({
      success: false,
      error: 'Favorite not found',
    });
  }

  await query('DELETE FROM favorite_meals WHERE id = ?', [req.params.id]);

  res.json({
    success: true,
    message: 'Removed from favorites',
  });
}));

/**
 * PATCH /api/meals/favorites/:id
 * Update favorite
 */
router.patch('/favorites/:id', authenticateToken, asyncHandler(async (req, res) => {
  const { tags, notes } = req.body;

  const favorite = await queryOne(
    'SELECT * FROM favorite_meals WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );

  if (!favorite) {
    return res.status(404).json({
      success: false,
      error: 'Favorite not found',
    });
  }

  const updates = {};
  if (tags !== undefined) updates.tags = JSON.stringify(tags);
  if (notes !== undefined) updates.notes = notes;

  if (Object.keys(updates).length > 0) {
    const setClause = Object.keys(updates).map(key => `${key} = ?`).join(', ');
    await query(
      `UPDATE favorite_meals SET ${setClause} WHERE id = ?`,
      [...Object.values(updates), req.params.id]
    );
  }

  const updated = await queryOne(
    'SELECT * FROM favorite_meals WHERE id = ?',
    [req.params.id]
  );

  res.json({
    success: true,
    message: 'Favorite updated',
    data: {
      id: updated.id,
      mealData: JSON.parse(updated.meal_data),
      tags: updated.tags ? JSON.parse(updated.tags) : [],
      notes: updated.notes,
    },
  });
}));

module.exports = router;

