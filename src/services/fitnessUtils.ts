/**
 * WaterTracker integration for FitnessDashboard.
 * Already built as WaterTracker.tsx — this adds water service methods to fitnessService.ts
 * and the streak calendar computation utility.
 */

// ── Water Tracking ──────────────────────────────────────────────────────────
export interface WaterLog {
  id: string;
  amount_ml: number;
  logged_at: string;
}

// ── Streak / Calendar Data ──────────────────────────────────────────────────
export interface StreakDay {
  date: string; // yyyy-MM-dd
  hasWorkout: boolean;
  hasMeal: boolean;
  waterMl: number;
  xp: number;
}

/**
 * Build a 28-day heatmap from completed session dates.
 * Pure front-end computation — no extra API call needed.
 */
export function buildStreakCalendar(
  completedSessionDates: string[], // ISO date strings
  last28Days: boolean = true
): StreakDay[] {
  const today = new Date();
  const days: StreakDay[] = [];
  const sessionSet = new Set(completedSessionDates.map(d => d.slice(0, 10)));

  for (let i = 27; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    days.push({
      date: dateStr,
      hasWorkout: sessionSet.has(dateStr),
      hasMeal: false, // placeholder — can cross-reference meal plan dates
      waterMl: 0,     // placeholder — would need water history endpoint
      xp: sessionSet.has(dateStr) ? 50 : 0,
    });
  }
  return days;
}

/**
 * Calculate current streak from sorted session dates (most recent first).
 */
export function calculateStreak(completedSessionDates: string[]): number {
  if (!completedSessionDates.length) return 0;
  const sorted = [...completedSessionDates]
    .map(d => d.slice(0, 10))
    .sort()
    .reverse();

  let streak = 0;
  const today = new Date().toISOString().slice(0, 10);
  let expected = today;

  for (const date of sorted) {
    if (date === expected) {
      streak++;
      const d = new Date(expected);
      d.setDate(d.getDate() - 1);
      expected = d.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return streak;
}
