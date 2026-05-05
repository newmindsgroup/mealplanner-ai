/**
 * Weekly Check-In API — Phase 7
 * POST /api/fitness/weekly-checkin
 * 
 * Saves check-in data, auto-logs weight if provided,
 * then asks AI to generate a personalized weekly plan adjustment.
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { execute, queryOne } = require('../config/database');
const { v4: uuidv4 } = require('uuid');

let Anthropic;
try { Anthropic = require('@anthropic-ai/sdk'); } catch { Anthropic = null; }

router.use(authenticateToken);

// Ensure table exists
async function ensureTable() {
  await execute(`
    CREATE TABLE IF NOT EXISTS fitness_checkins (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      person_id VARCHAR(36),
      weight_kg DECIMAL(5,2),
      energy_level TINYINT,
      sleep_quality TINYINT,
      stress_level TINYINT,
      sore_areas JSON,
      mood VARCHAR(20),
      notes TEXT,
      ai_adjustment TEXT,
      checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_ci_user (user_id),
      INDEX idx_ci_person (person_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  `).catch(() => {});
}

// POST /api/fitness/weekly-checkin
router.post('/', asyncHandler(async (req, res) => {
  await ensureTable();

  const {
    person_id, weight_kg, energy_level, sleep_quality,
    stress_level, sore_areas, mood, notes,
  } = req.body;

  const personId = person_id || null;

  // Auto-log weight as a body measurement if provided
  if (weight_kg) {
    await execute(
      `INSERT INTO body_measurements (id, user_id, person_id, weight_kg, measured_at)
       VALUES (?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE weight_kg = VALUES(weight_kg)`,
      [uuidv4(), req.userId, personId, weight_kg]
    ).catch(() => {});
  }

  // Fetch fitness profile for context
  const whereClause = personId
    ? 'user_id = ? AND person_id = ?'
    : 'user_id = ? AND (person_id IS NULL OR person_id = "")';
  const profile = await queryOne(
    `SELECT * FROM fitness_profiles WHERE ${whereClause}`,
    personId ? [req.userId, personId] : [req.userId]
  ).catch(() => null);

  // Parse profile JSON fields
  if (profile) {
    ['equipment', 'training_styles', 'injuries'].forEach(f => {
      if (typeof profile[f] === 'string') try { profile[f] = JSON.parse(profile[f]); } catch { profile[f] = []; }
    });
  }

  // Generate AI adjustment
  let aiAdjustment = 'Check-in saved! Your fitness plan will be calibrated based on your weekly data.';

  if (Anthropic) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

      const soreList = Array.isArray(sore_areas) ? sore_areas.join(', ') : 'none';
      const profileSummary = profile
        ? `Goal: ${profile.primary_goal || 'general health'} | Level: ${profile.fitness_level || 'beginner'} | ${profile.days_per_week || 3}x/week | Equipment: ${(profile.equipment || []).join(', ') || 'bodyweight'}`
        : 'No profile set';

      const prompt = `You are a personal fitness coach. A user just completed their weekly check-in.

PROFILE: ${profileSummary}

CHECK-IN DATA:
- Mood: ${mood || 'good'}
- Energy level: ${energy_level}/10
- Sleep quality: ${sleep_quality}/10
- Stress level: ${stress_level}/5
- Sore areas: ${soreList}
- Notes: ${notes || 'none'}
${weight_kg ? `- New weight logged: ${weight_kg} kg` : ''}

Based on this check-in, provide a SHORT (2–3 sentences) personalized adjustment recommendation for their week ahead. 
Be specific and actionable. Reference their actual data. If energy/sleep is low, suggest deloading or active recovery.
If they're feeling great, encourage pushing harder. Mention specific muscle groups to avoid if sore.
Be warm, encouraging, and coach-like.`;

      const msg = await client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      });

      aiAdjustment = msg.content[0]?.type === 'text' ? msg.content[0].text : aiAdjustment;
    } catch (e) {
      console.warn('[WeeklyCheckIn] AI adjustment failed:', e.message);
    }
  }

  // Save check-in record
  const id = uuidv4();
  await execute(
    `INSERT INTO fitness_checkins
     (id, user_id, person_id, weight_kg, energy_level, sleep_quality, stress_level, sore_areas, mood, notes, ai_adjustment)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, req.userId, personId, weight_kg || null, energy_level, sleep_quality, stress_level,
     JSON.stringify(sore_areas || []), mood, notes || null, aiAdjustment]
  );

  res.json({ success: true, data: { id, aiAdjustment } });
}));

// GET /api/fitness/weekly-checkin/last — last check-in for this person
router.get('/last', asyncHandler(async (req, res) => {
  await ensureTable();
  const personId = req.query.personId || null;
  const whereClause = personId
    ? 'user_id = ? AND person_id = ?'
    : 'user_id = ?';
  const params = personId ? [req.userId, personId] : [req.userId];
  const last = await queryOne(
    `SELECT * FROM fitness_checkins WHERE ${whereClause} ORDER BY checked_in_at DESC LIMIT 1`,
    params
  );
  res.json({ success: true, data: last || null });
}));

module.exports = router;
