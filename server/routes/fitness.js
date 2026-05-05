// Fitness Routes — /api/fitness/*
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query, queryOne, execute } = require('../config/database');
const { analyzeBodyPhoto, generateWorkoutPlan, analyzeProgress } = require('../services/fitnessAIService');

// All routes require authentication
router.use(authenticateToken);

// Multer config for body photo uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../../uploads/body-analyses', req.userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}.jpg`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    cb(null, true);
  },
});

// ============================================================================
// FITNESS PROFILE
// ============================================================================

// GET /api/fitness/profile
router.get('/profile', asyncHandler(async (req, res) => {
  const personId = req.query.personId || null;
  const where = personId
    ? 'WHERE user_id = ? AND person_id = ?'
    : 'WHERE user_id = ? AND (person_id IS NULL OR person_id = "")';
  const params = personId ? [req.userId, personId] : [req.userId];
  const profile = await queryOne(`SELECT * FROM fitness_profiles ${where}`, params);
  res.json({ success: true, data: profile || null });
}));

// POST /api/fitness/profile
router.post('/profile', asyncHandler(async (req, res) => {
  const {
    person_id,
    height_cm, weight_kg, body_fat_pct, fitness_level, primary_goal,
    secondary_goals, equipment, training_styles, days_per_week,
    session_duration_min, preferred_time, injuries, photo_retention,
  } = req.body;

  const personId = person_id || null;

  // Validate person_id belongs to this user if provided
  if (personId) {
    const person = await queryOne(
      'SELECT id FROM people WHERE id = ? AND user_id = ?',
      [personId, req.userId]
    ).catch(() => null);
    if (!person) {
      return res.status(403).json({ success: false, error: 'Person not found or not in your family' });
    }
  }

  const whereClause = personId
    ? 'user_id = ? AND person_id = ?'
    : 'user_id = ? AND (person_id IS NULL OR person_id = "")';
  const whereParams = personId ? [req.userId, personId] : [req.userId];

  const existing = await queryOne(
    `SELECT id FROM fitness_profiles WHERE ${whereClause}`,
    whereParams
  );

  if (existing) {
    await execute(
      `UPDATE fitness_profiles SET
        height_cm=?, weight_kg=?, body_fat_pct=?, fitness_level=?, primary_goal=?,
        secondary_goals=?, equipment=?, training_styles=?, days_per_week=?,
        session_duration_min=?, preferred_time=?, injuries=?, photo_retention=?
       WHERE id=?`,
      [
        height_cm || null, weight_kg || null, body_fat_pct || null,
        fitness_level || 'beginner', primary_goal || null,
        JSON.stringify(secondary_goals || []), JSON.stringify(equipment || []),
        JSON.stringify(training_styles || []), days_per_week || 3,
        session_duration_min || 45, preferred_time || 'morning',
        JSON.stringify(injuries || []), photo_retention || '30_days',
        existing.id,
      ]
    );
  } else {
    const id = uuidv4();
    await execute(
      `INSERT INTO fitness_profiles
        (id, user_id, person_id, height_cm, weight_kg, body_fat_pct, fitness_level, primary_goal,
         secondary_goals, equipment, training_styles, days_per_week, session_duration_min,
         preferred_time, injuries, photo_retention)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [
        id, req.userId, personId,
        height_cm || null, weight_kg || null, body_fat_pct || null,
        fitness_level || 'beginner', primary_goal || null,
        JSON.stringify(secondary_goals || []), JSON.stringify(equipment || []),
        JSON.stringify(training_styles || []), days_per_week || 3,
        session_duration_min || 45, preferred_time || 'morning',
        JSON.stringify(injuries || []), photo_retention || '30_days',
      ]
    );
  }

  const profile = await queryOne(
    `SELECT * FROM fitness_profiles WHERE ${whereClause}`,
    whereParams
  );
  res.json({ success: true, data: profile });
}));

// ============================================================================
// BODY ANALYSIS
// ============================================================================

// GET /api/fitness/body-analysis
router.get('/body-analysis', asyncHandler(async (req, res) => {
  const analyses = await query(
    'SELECT id, analyzed_at, delete_at, body_type, estimated_bf, muscle_mass, ai_notes, recommendations FROM body_analyses WHERE user_id = ? ORDER BY analyzed_at DESC LIMIT 10',
    [req.userId]
  );
  res.json({ success: true, data: analyses });
}));

// POST /api/fitness/body-analysis
router.post('/body-analysis', upload.single('photo'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: 'Photo is required' });
  }

  // Get user's retention preference
  const profile = await queryOne('SELECT photo_retention FROM fitness_profiles WHERE user_id = ?', [req.userId]);
  const retention = profile?.photo_retention || '30_days';

  // Read photo as base64 for AI
  const photoData = fs.readFileSync(req.file.path).toString('base64');
  const photoPath = req.file.path;

  // Run AI analysis
  let analysis;
  try {
    analysis = await analyzeBodyPhoto(photoData, 'image/jpeg', req.userId);
  } catch (err) {
    // Clean up photo on AI error
    fs.unlinkSync(photoPath);
    return res.status(500).json({ success: false, error: 'AI analysis failed: ' + err.message });
  }

  // Determine delete date
  const deleteAt = retention === 'immediate' ? new Date() : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  // If immediate deletion, remove file now
  if (retention === 'immediate') {
    fs.unlinkSync(photoPath);
  }

  // Store analysis result
  const id = uuidv4();
  await execute(
    `INSERT INTO body_analyses (id, user_id, photo_path, delete_at, body_type, estimated_bf, muscle_mass, ai_notes, recommendations)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, req.userId,
      retention === 'immediate' ? null : photoPath,
      deleteAt,
      analysis.bodyType || null,
      analysis.estimatedBodyFat || null,
      analysis.muscleDistribution ? (analysis.estimatedBodyFat < 15 ? 'high' : analysis.estimatedBodyFat < 25 ? 'moderate' : 'low') : null,
      analysis.motivationalNote || null,
      JSON.stringify(analysis),
    ]
  );

  // Update fitness profile body fat if detected
  if (analysis.estimatedBodyFat) {
    await execute(
      'UPDATE fitness_profiles SET body_fat_pct = ? WHERE user_id = ?',
      [analysis.estimatedBodyFat, req.userId]
    );
  }

  res.json({ success: true, data: { id, ...analysis, retention } });
}));

// DELETE /api/fitness/body-analysis/:id
router.delete('/body-analysis/:id', asyncHandler(async (req, res) => {
  const analysis = await queryOne(
    'SELECT id, photo_path FROM body_analyses WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (!analysis) return res.status(404).json({ success: false, error: 'Analysis not found' });

  // Delete photo file if exists
  if (analysis.photo_path && fs.existsSync(analysis.photo_path)) {
    fs.unlinkSync(analysis.photo_path);
  }
  await execute('DELETE FROM body_analyses WHERE id = ?', [analysis.id]);
  res.json({ success: true, message: 'Analysis deleted' });
}));

// ============================================================================
// WORKOUT PLANS
// ============================================================================

// GET /api/fitness/workout-plan
router.get('/workout-plan', asyncHandler(async (req, res) => {
  const personId = req.query.personId || null;
  const extra = personId ? ' AND person_id = ?' : ' AND (person_id IS NULL OR person_id = "")';
  const params = personId ? [req.userId, personId] : [req.userId];
  const plan = await queryOne(
    `SELECT * FROM workout_plans WHERE user_id = ?${extra} AND is_active = 1 ORDER BY week_start DESC LIMIT 1`,
    params
  );
  if (plan && plan.plan_data) {
    plan.plan_data = typeof plan.plan_data === 'string' ? JSON.parse(plan.plan_data) : plan.plan_data;
  }
  res.json({ success: true, data: plan || null });
}));

// POST /api/fitness/workout-plan
router.post('/workout-plan', asyncHandler(async (req, res) => {
  const personId = req.body.person_id || null;
  const whereClause = personId
    ? 'user_id = ? AND person_id = ?'
    : 'user_id = ? AND (person_id IS NULL OR person_id = "")';
  const whereParams = personId ? [req.userId, personId] : [req.userId];

  const profile = await queryOne(
    `SELECT * FROM fitness_profiles WHERE ${whereClause}`,
    whereParams
  );
  if (!profile) {
    return res.status(400).json({ success: false, error: 'Complete your fitness profile first' });
  }

  ['secondary_goals', 'equipment', 'training_styles', 'injuries'].forEach(field => {
    if (typeof profile[field] === 'string') {
      try { profile[field] = JSON.parse(profile[field]); } catch { profile[field] = []; }
    }
  });

  // Get latest body analysis for this person
  const baExtra = personId ? ' AND person_id = ?' : ' AND (person_id IS NULL OR person_id = "")';
  const baParams = personId ? [req.userId, personId] : [req.userId];
  const bodyAnalysis = await queryOne(
    `SELECT recommendations FROM body_analyses WHERE user_id = ?${baExtra} ORDER BY analyzed_at DESC LIMIT 1`,
    baParams
  );
  let analysisData = null;
  if (bodyAnalysis?.recommendations) {
    try { analysisData = typeof bodyAnalysis.recommendations === 'string' ? JSON.parse(bodyAnalysis.recommendations) : bodyAnalysis.recommendations; }
    catch { analysisData = null; }
  }

  // Blood type: from specific person or first family member
  const personRecord = personId
    ? await queryOne('SELECT blood_type FROM people WHERE id = ?', [personId]).catch(() => null)
    : await queryOne('SELECT blood_type FROM people WHERE user_id = ? LIMIT 1', [req.userId]).catch(() => null);
  const bloodType = personRecord?.blood_type || null;

  const weekStart = req.body.week_start || new Date().toISOString().split('T')[0];
  // Deactivate old plans for this person+week
  const deactivateExtra = personId ? ' AND person_id = ?' : ' AND (person_id IS NULL OR person_id = "")';
  await execute(
    `UPDATE workout_plans SET is_active = 0 WHERE user_id = ?${deactivateExtra} AND week_start = ?`,
    personId ? [req.userId, personId, weekStart] : [req.userId, weekStart]
  );

  const planData = await generateWorkoutPlan(profile, analysisData, bloodType, req.userId);

  const id = uuidv4();
  await execute(
    'INSERT INTO workout_plans (id, user_id, person_id, name, week_start, goal, plan_data, ai_provider, is_active) VALUES (?,?,?,?,?,?,?,?,1)',
    [id, req.userId, personId, planData.planName || 'Weekly Plan', weekStart, profile.primary_goal, JSON.stringify(planData), 'anthropic']
  );

  res.json({ success: true, data: { id, ...planData } });
}));

// ============================================================================
// WORKOUT SESSIONS
// ============================================================================

// GET /api/fitness/sessions
router.get('/sessions', asyncHandler(async (req, res) => {
  const personId = req.query.personId || null;
  const extra = personId ? ' AND person_id = ?' : '';
  const params = personId ? [req.userId, personId] : [req.userId];
  const sessions = await query(
    `SELECT * FROM workout_sessions WHERE user_id = ?${extra} ORDER BY scheduled_date DESC LIMIT 50`,
    params
  );
  res.json({ success: true, data: sessions });
}));

// POST /api/fitness/session/:id/complete
router.post('/session/:id/complete', asyncHandler(async (req, res) => {
  const { duration_min, exercises, notes, mood } = req.body;

  const session = await queryOne(
    'SELECT id FROM workout_sessions WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  if (!session) return res.status(404).json({ success: false, error: 'Session not found' });

  await execute(
    `UPDATE workout_sessions SET completed_at = NOW(), duration_min = ?, exercises = ?, notes = ?, mood = ? WHERE id = ?`,
    [duration_min || null, JSON.stringify(exercises || []), notes || null, mood || 'good', req.params.id]
  );

  // Award XP for completing a session
  await execute(
    `INSERT INTO user_progress (user_id, xp, streak, meals_completed)
     VALUES (?, 50, 1, 0)
     ON DUPLICATE KEY UPDATE xp = xp + 50, streak = streak + 1`,
    [req.userId]
  ).catch(() => {}); // Non-fatal

  res.json({ success: true, message: 'Session completed! +50 XP' });
}));

// ============================================================================
// BODY MEASUREMENTS
// ============================================================================

// GET /api/fitness/measurements
router.get('/measurements', asyncHandler(async (req, res) => {
  const measurements = await query(
    'SELECT * FROM body_measurements WHERE user_id = ? ORDER BY measured_at DESC LIMIT 52',
    [req.userId]
  );
  res.json({ success: true, data: measurements });
}));

// POST /api/fitness/measurements
router.post('/measurements', asyncHandler(async (req, res) => {
  const { weight_kg, body_fat_pct, chest_cm, waist_cm, hips_cm, bicep_cm, thigh_cm, notes } = req.body;
  const id = uuidv4();
  await execute(
    `INSERT INTO body_measurements (id, user_id, weight_kg, body_fat_pct, chest_cm, waist_cm, hips_cm, bicep_cm, thigh_cm, notes)
     VALUES (?,?,?,?,?,?,?,?,?,?)`,
    [id, req.userId, weight_kg || null, body_fat_pct || null, chest_cm || null, waist_cm || null,
     hips_cm || null, bicep_cm || null, thigh_cm || null, notes || null]
  );

  // Also update fitness_profile weight
  if (weight_kg) {
    await execute('UPDATE fitness_profiles SET weight_kg = ? WHERE user_id = ?', [weight_kg, req.userId]);
  }

  res.json({ success: true, data: { id } });
}));

// ============================================================================
// PERSONAL RECORDS
// ============================================================================

// GET /api/fitness/records
router.get('/records', asyncHandler(async (req, res) => {
  const records = await query(
    'SELECT * FROM personal_records WHERE user_id = ? ORDER BY achieved_at DESC',
    [req.userId]
  );
  res.json({ success: true, data: records });
}));

// POST /api/fitness/records
router.post('/records', asyncHandler(async (req, res) => {
  const { exercise, record_type, value, unit } = req.body;
  if (!exercise || !record_type || !value) {
    return res.status(400).json({ success: false, error: 'exercise, record_type, and value are required' });
  }
  const id = uuidv4();
  await execute(
    'INSERT INTO personal_records (id, user_id, exercise, record_type, value, unit) VALUES (?,?,?,?,?,?)',
    [id, req.userId, exercise, record_type, value, unit || null]
  );
  res.json({ success: true, data: { id } });
}));

// ============================================================================
// PROGRESS ANALYSIS
// ============================================================================

// GET /api/fitness/progress-analysis
router.get('/progress-analysis', asyncHandler(async (req, res) => {
  const [sessions, measurements, records, profile] = await Promise.all([
    query('SELECT mood, scheduled_date, completed_at FROM workout_sessions WHERE user_id = ? ORDER BY scheduled_date DESC LIMIT 28', [req.userId]),
    query('SELECT weight_kg, body_fat_pct, measured_at FROM body_measurements WHERE user_id = ? ORDER BY measured_at DESC LIMIT 20', [req.userId]),
    query('SELECT exercise, record_type, value, achieved_at FROM personal_records WHERE user_id = ? ORDER BY achieved_at DESC LIMIT 20', [req.userId]),
    queryOne('SELECT primary_goal, fitness_level FROM fitness_profiles WHERE user_id = ?', [req.userId]),
  ]);

  if (!profile) {
    return res.json({ success: true, data: null });
  }

  const analysis = await analyzeProgress(sessions, measurements, records, profile, req.userId);
  res.json({ success: true, data: analysis });
}));

// ============================================================================
// WATER / HYDRATION TRACKING
// ============================================================================

// Ensure water_logs table exists (idempotent)
const ensureWaterTable = async () => {
  await execute(`
    CREATE TABLE IF NOT EXISTS water_logs (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      amount_ml INT NOT NULL DEFAULT 250,
      logged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_water_user_date (user_id, logged_at)
    )
  `);
};

// GET /api/fitness/water/today
router.get('/water/today', asyncHandler(async (req, res) => {
  await ensureWaterTable();
  const logs = await query(
    `SELECT id, amount_ml, logged_at FROM water_logs
     WHERE user_id = ? AND DATE(logged_at) = CURDATE()
     ORDER BY logged_at DESC`,
    [req.userId]
  );
  res.json({ success: true, data: logs });
}));

// POST /api/fitness/water
router.post('/water', asyncHandler(async (req, res) => {
  await ensureWaterTable();
  const { amount_ml } = req.body;
  if (!amount_ml || amount_ml < 1 || amount_ml > 5000) {
    return res.status(400).json({ success: false, error: 'amount_ml must be 1–5000' });
  }
  const id = uuidv4();
  await execute(
    'INSERT INTO water_logs (id, user_id, amount_ml) VALUES (?, ?, ?)',
    [id, req.userId, amount_ml]
  );
  res.json({ success: true, data: { id } });
}));

// DELETE /api/fitness/water/:id
router.delete('/water/:id', asyncHandler(async (req, res) => {
  await execute(
    'DELETE FROM water_logs WHERE id = ? AND user_id = ?',
    [req.params.id, req.userId]
  );
  res.json({ success: true });
}));

module.exports = router;
