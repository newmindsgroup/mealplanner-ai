/**
 * AI Progress Review API — Phase 9
 * GET /api/fitness/progress-review?personId=&force=1
 * 
 * Fetches 4-week session history, measurements, PRs, check-ins.
 * Calls Claude to generate a structured weekly review.
 * Caches result for 24hrs (unless force=1).
 */
const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { query, queryOne } = require('../config/database');

let Anthropic;
try { Anthropic = require('@anthropic-ai/sdk'); } catch { Anthropic = null; }

router.use(authenticateToken);

// Simple in-memory cache {key: {data, expiry}}
const cache = new Map();

router.get('/', asyncHandler(async (req, res) => {
  const personId = req.query.personId || null;
  const force = req.query.force === '1';
  const cacheKey = `${req.userId}::${personId}`;

  // Return cached if fresh
  if (!force && cache.has(cacheKey)) {
    const cached = cache.get(cacheKey);
    if (cached.expiry > Date.now()) return res.json({ success: true, data: cached.data });
  }

  // Fetch data in parallel
  const fourWeeksAgo = new Date(Date.now() - 28 * 86400000).toISOString().slice(0, 19).replace('T', ' ');
  const whereClause = personId
    ? 'user_id = ? AND person_id = ?'
    : 'user_id = ?';
  const params = personId ? [req.userId, personId] : [req.userId];

  const [sessions, measurements, records, profile, lastCheckIn] = await Promise.all([
    query(`SELECT * FROM workout_sessions WHERE ${whereClause} AND (completed_at IS NOT NULL OR created_at >= ?) ORDER BY completed_at DESC LIMIT 50`, [...params, fourWeeksAgo]).catch(() => []),
    query(`SELECT * FROM body_measurements WHERE ${whereClause} ORDER BY measured_at DESC LIMIT 10`, params).catch(() => []),
    query(`SELECT * FROM personal_records WHERE ${whereClause} ORDER BY set_at DESC LIMIT 20`, params).catch(() => []),
    queryOne(`SELECT * FROM fitness_profiles WHERE ${whereClause}`, params).catch(() => null),
    queryOne(`SELECT * FROM fitness_checkins WHERE ${whereClause} ORDER BY checked_in_at DESC LIMIT 1`, params).catch(() => null),
  ]);

  // Calculate stats
  const recentSessions = sessions.filter(s => new Date(s.completed_at || s.created_at) >= new Date(fourWeeksAgo));
  const completedSessions = recentSessions.filter(s => s.completed_at);
  const daysPerWeek = profile?.days_per_week || 3;
  const sessionsPlanned = daysPerWeek * 4;
  const completionRate = sessionsPlanned > 0 ? Math.round((completedSessions.length / sessionsPlanned) * 100) : 0;

  // Streak calc
  const sessionDates = completedSessions.map(s => s.completed_at?.toString().slice(0, 10)).filter(Boolean);
  const uniqueDates = [...new Set(sessionDates)].sort().reverse();
  let streak = 0;
  let check = new Date();
  check.setHours(0, 0, 0, 0);
  for (const d of uniqueDates) {
    const dd = new Date(d);
    dd.setHours(0, 0, 0, 0);
    const diff = Math.round((check.getTime() - dd.getTime()) / 86400000);
    if (diff <= 1) { streak++; check = dd; } else break;
  }

  // Weight trend
  let weightTrend = 'unknown';
  if (measurements.length >= 2) {
    const diff = measurements[0].weight_kg - measurements[measurements.length - 1].weight_kg;
    weightTrend = diff < -0.5 ? 'losing' : diff > 0.5 ? 'gaining' : 'stable';
  }

  // Default review without AI
  let review = {
    overallProgress: completionRate >= 80 ? 'excellent' : completionRate >= 60 ? 'good' : completionRate >= 40 ? 'steady' : 'plateau',
    completionRate,
    sessionsCompleted: completedSessions.length,
    sessionsPlanned,
    keyInsights: [
      `You completed ${completedSessions.length} of ${sessionsPlanned} planned sessions in the last 4 weeks.`,
      `Your current streak is ${streak} day${streak !== 1 ? 's' : ''}.`,
      records.length > 0 ? `You've set ${records.length} personal records — keep pushing!` : 'Try setting a new PR this week.',
    ],
    strengths: completedSessions.length >= sessionsPlanned * 0.7 ? ['Excellent workout consistency'] : ['Getting started and building habits'],
    areasToImprove: completionRate < 60 ? ['Increase workout frequency to meet your plan'] : ['Push intensity on strong days'],
    nextWeekAdjustments: completionRate >= 80 ? 'You\'re crushing it — consider adding a challenging new exercise or increasing weights by 5-10%.' : 'Focus on hitting at least 3 sessions next week. Quality over quantity.',
    motivationalMessage: 'Every session brings you closer to your goals. Keep showing up!',
    weightTrend,
    streakDays: streak,
    generatedAt: new Date().toISOString(),
  };

  // Try AI enhancement
  if (Anthropic && process.env.ANTHROPIC_API_KEY) {
    try {
      const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      const lastCI = lastCheckIn ? `Energy: ${lastCheckIn.energy_level}/10, Sleep: ${lastCheckIn.sleep_quality}/10, Mood: ${lastCheckIn.mood}` : 'No check-in data';
      const prompt = `You are an expert personal trainer analyzing 4 weeks of fitness data for a client.

PROFILE: Goal=${profile?.primary_goal || 'general health'} | Level=${profile?.fitness_level || 'beginner'} | Plan=${daysPerWeek}x/week
SESSIONS: ${completedSessions.length} completed of ${sessionsPlanned} planned (${completionRate}% completion)
STREAK: ${streak} days
WEIGHT: ${measurements[0]?.weight_kg || 'unknown'} kg (trend: ${weightTrend})
PRs SET: ${records.length}
LATEST CHECK-IN: ${lastCI}

Return ONLY valid JSON:
{
  "overallProgress": "excellent|good|steady|plateau|declining",
  "keyInsights": ["<insight 1>","<insight 2>","<insight 3>"],
  "strengths": ["<strength>","<strength>"],
  "areasToImprove": ["<area>","<area>"],
  "nextWeekAdjustments": "<specific 1-2 sentence plan for next week>",
  "motivationalMessage": "<genuine, personalized 1-sentence encouragement>"
}`;

      const msg = await client.messages.create({
        model: 'claude-3-haiku-20240307', max_tokens: 500,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = msg.content[0]?.type === 'text' ? msg.content[0].text : '';
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const aiData = JSON.parse(match[0]);
        review = { ...review, ...aiData };
      }
    } catch (e) {
      console.warn('[ProgressReview] AI failed:', e.message);
    }
  }

  review.generatedAt = new Date().toISOString();

  // Cache for 8 hours
  cache.set(cacheKey, { data: review, expiry: Date.now() + 8 * 3600 * 1000 });

  res.json({ success: true, data: review });
}));

module.exports = router;
