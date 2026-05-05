/**
 * Family Fitness Leaderboard API
 * GET /api/fitness/leaderboard
 * 
 * Aggregates per-person stats across all family members:
 * - streak (consecutive days with a completed session)
 * - total sessions completed
 * - total XP (50 per session + 100 per PR)
 * - total PRs
 * - this-week sessions
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query } = require('../config/database');

router.use(authenticateToken);

// GET /api/fitness/leaderboard
router.get('/', asyncHandler(async (req, res) => {
  // 1. Get all family members
  const people = await query(
    'SELECT id, name, age, blood_type FROM people WHERE user_id = ? ORDER BY name',
    [req.userId]
  );
  if (!people.length) return res.json({ success: true, data: [] });

  const personIds = people.map(p => p.id);
  const placeholders = personIds.map(() => '?').join(',');

  // 2. Completed session counts (all time + this week)
  const weekStart = (() => {
    const d = new Date();
    d.setDate(d.getDate() - d.getDay());
    return d.toISOString().slice(0, 10);
  })();

  const [sessions, weekSessions, prs, profiles] = await Promise.all([
    // all-time completed sessions per person
    query(
      `SELECT person_id, COUNT(*) as total, MAX(completed_at) as last_session
       FROM workout_sessions
       WHERE user_id = ? AND person_id IN (${placeholders}) AND completed_at IS NOT NULL
       GROUP BY person_id`,
      [req.userId, ...personIds]
    ),
    // this-week sessions
    query(
      `SELECT person_id, COUNT(*) as week_total
       FROM workout_sessions
       WHERE user_id = ? AND person_id IN (${placeholders}) AND completed_at >= ? AND completed_at IS NOT NULL
       GROUP BY person_id`,
      [req.userId, ...personIds, weekStart]
    ),
    // personal records count per person
    query(
      `SELECT person_id, COUNT(*) as pr_count
       FROM personal_records
       WHERE user_id = ? AND person_id IN (${placeholders})
       GROUP BY person_id`,
      [req.userId, ...personIds]
    ),
    // fitness profiles for goal display
    query(
      `SELECT person_id, primary_goal, fitness_level, days_per_week
       FROM fitness_profiles
       WHERE user_id = ? AND person_id IN (${placeholders})`,
      [req.userId, ...personIds]
    ),
  ]);

  // Index by person_id for fast lookup
  const sessMap = Object.fromEntries((sessions || []).map(s => [s.person_id, s]));
  const weekMap = Object.fromEntries((weekSessions || []).map(s => [s.person_id, s]));
  const prMap = Object.fromEntries((prs || []).map(p => [p.person_id, p]));
  const profMap = Object.fromEntries((profiles || []).map(p => [p.person_id, p]));

  // Build leaderboard entries
  const entries = people.map(person => {
    const sess = sessMap[person.id] || {};
    const week = weekMap[person.id] || {};
    const pr = prMap[person.id] || {};
    const prof = profMap[person.id] || {};

    const totalSessions = parseInt(sess.total || 0);
    const prCount = parseInt(pr.pr_count || 0);
    const xp = totalSessions * 50 + prCount * 100;
    const weekCount = parseInt(week.week_total || 0);

    // Compute streak from last_session (simple: if last session was today or yesterday, add 1)
    // Full streak calc would need the full session list; here we use a shortcut
    const lastSession = sess.last_session ? new Date(sess.last_session) : null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const daysSinceLast = lastSession
      ? Math.floor((today - lastSession) / 86400000)
      : 999;
    const streak = daysSinceLast <= 1 ? Math.min(totalSessions, weekCount + 1) : 0;

    return {
      personId: person.id,
      name: person.name,
      age: person.age,
      bloodType: person.blood_type,
      goal: prof.primary_goal || null,
      fitnessLevel: prof.fitness_level || null,
      daysPerWeek: prof.days_per_week || 0,
      totalSessions,
      weekSessions: weekCount,
      prCount,
      xp,
      streak,
      lastSession: sess.last_session || null,
      hasProfile: !!prof.primary_goal,
    };
  });

  // Sort by XP descending
  entries.sort((a, b) => b.xp - a.xp);

  res.json({ success: true, data: entries });
}));

module.exports = router;
