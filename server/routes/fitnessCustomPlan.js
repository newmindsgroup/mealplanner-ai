/**
 * Custom Plan API — Phase 8
 * POST /api/fitness/custom-plan — saves a user-built plan as an active workout plan
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { execute, queryOne } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

router.use(authenticateToken);

// POST /api/fitness/custom-plan
router.post('/', asyncHandler(async (req, res) => {
  const { plan_data, plan_name, week_start, person_id } = req.body;
  const personId = person_id || null;

  if (!plan_data) return res.status(400).json({ success: false, error: 'plan_data is required' });

  // Deactivate old custom plans for this person
  await execute(
    `UPDATE workout_plans SET is_active = 0
     WHERE user_id = ? AND (person_id = ? OR (person_id IS NULL AND ? IS NULL))`,
    [req.userId, personId, personId]
  );

  const id = uuidv4();
  const ws = week_start || new Date().toISOString().split('T')[0];

  await execute(
    `INSERT INTO workout_plans (id, user_id, person_id, plan_name, week_start, plan_data, is_active, generated_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, NOW())`,
    [id, req.userId, personId, plan_name || 'Custom Plan', ws, JSON.stringify(plan_data)]
  );

  const saved = await queryOne('SELECT * FROM workout_plans WHERE id = ?', [id]);
  if (saved && typeof saved.plan_data === 'string') {
    try { saved.plan_data = JSON.parse(saved.plan_data); } catch { /* keep string */ }
  }

  res.json({ success: true, data: saved });
}));

module.exports = router;
