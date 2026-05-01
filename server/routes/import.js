// Data Import Routes (for localStorage migration)
const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');

const { query, transaction } = require('../config/database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

/**
 * POST /api/import/data
 * Import localStorage data to database
 */
router.post('/data', authenticateToken, asyncHandler(async (req, res) => {
  const {
    people,
    plans,
    groceryLists,
    pantryItems,
    labReports,
    favoriteMeals,
    labelAnalyses,
    knowledgeBase,
    chatMessages,
    settings,
    progress,
  } = req.body;

  const results = {
    people: 0,
    plans: 0,
    groceryLists: 0,
    pantryItems: 0,
    labReports: 0,
    favoriteMeals: 0,
    labelAnalyses: 0,
    knowledgeBase: 0,
    chatMessages: 0,
  };

  await transaction(async (conn) => {
    // Import people
    if (Array.isArray(people)) {
      for (const person of people) {
        const personId = uuidv4();
        await conn.execute(
          `INSERT INTO people (id, user_id, name, blood_type, age, allergies, goals, dietary_restrictions, health_conditions)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            personId,
            req.userId,
            person.name,
            person.bloodType || null,
            person.age || null,
            JSON.stringify(person.allergies || []),
            JSON.stringify(person.goals || []),
            JSON.stringify(person.dietaryRestrictions || []),
            JSON.stringify(person.healthConditions || []),
          ]
        );
        results.people++;
      }
    }

    // Import meal plans
    if (Array.isArray(plans)) {
      for (const plan of plans) {
        const planId = uuidv4();
        await conn.execute(
          `INSERT INTO meal_plans (id, user_id, week_start, week_end, plan_data, people_ids, preferences)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            planId,
            req.userId,
            plan.weekStart || new Date(),
            plan.weekEnd || new Date(),
            JSON.stringify(plan.meals || {}),
            JSON.stringify(plan.peopleIds || []),
            JSON.stringify(plan.preferences || {}),
          ]
        );
        results.plans++;
      }
    }

    // Import grocery lists
    if (Array.isArray(groceryLists)) {
      for (const list of groceryLists) {
        await conn.execute(
          'INSERT INTO grocery_lists (id, user_id, name, list_data) VALUES (?, ?, ?, ?)',
          [
            uuidv4(),
            req.userId,
            list.name || 'Imported List',
            JSON.stringify(list.items || []),
          ]
        );
        results.groceryLists++;
      }
    }

    // Import pantry items
    if (Array.isArray(pantryItems)) {
      for (const item of pantryItems) {
        await conn.execute(
          `INSERT INTO pantry_items (
            id, user_id, name, category, quantity, unit, location,
            expiration_date, low_stock_threshold, is_low_stock
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            uuidv4(),
            req.userId,
            item.name,
            item.category || 'other',
            item.quantity || 1,
            item.unit || 'count',
            item.location || null,
            item.expirationDate || null,
            item.lowStockThreshold || 1,
            item.isLowStock || false,
          ]
        );
        results.pantryItems++;
      }
    }

    // Import favorite meals
    if (Array.isArray(favoriteMeals)) {
      for (const meal of favoriteMeals) {
        await conn.execute(
          'INSERT INTO favorite_meals (id, user_id, meal_data) VALUES (?, ?, ?)',
          [uuidv4(), req.userId, JSON.stringify(meal)]
        );
        results.favoriteMeals++;
      }
    }

    // Update settings if provided
    if (settings) {
      await conn.execute(
        'UPDATE user_profiles SET settings = ? WHERE user_id = ?',
        [JSON.stringify(settings), req.userId]
      );
    }

    // Update progress if provided
    if (progress) {
      await conn.execute(
        `UPDATE user_progress SET
         level = ?, xp = ?, xp_to_next_level = ?, streak = ?, meals_completed = ?, badges = ?
         WHERE user_id = ?`,
        [
          progress.level || 1,
          progress.xp || 0,
          progress.xpToNextLevel || 100,
          progress.streak || 0,
          progress.mealsCompleted || 0,
          JSON.stringify(progress.badges || []),
          req.userId,
        ]
      );
    }
  });

  res.json({
    success: true,
    message: 'Data imported successfully',
    data: {
      imported: results,
      total: Object.values(results).reduce((sum, count) => sum + count, 0),
    },
  });
}));

module.exports = router;

