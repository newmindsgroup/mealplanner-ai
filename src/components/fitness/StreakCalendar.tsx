/**
 * StreakCalendar — 28-day GitHub-style contribution heatmap for workout consistency
 * Phase 4 gamification feature.
 */
import React, { useMemo } from 'react';
import { Flame, Zap, Calendar } from 'lucide-react';
import { buildStreakCalendar, calculateStreak } from '../../services/fitnessUtils';

interface Props {
  completedSessionDates: string[]; // ISO date strings where sessions were completed
  totalXP?: number;
}

const INTENSITY_COLORS = [
  'bg-gray-100 dark:bg-gray-800',           // 0 — no activity
  'bg-orange-100 dark:bg-orange-900/40',    // 1 — rest/active recovery
  'bg-orange-300 dark:bg-orange-600/60',    // 2 — light workout
  'bg-orange-500 dark:bg-orange-500',       // 3 — full workout
  'bg-rose-600 dark:bg-rose-500',           // 4 — PR / high intensity
];

const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakCalendar({ completedSessionDates, totalXP = 0 }: Props) {
  const days = useMemo(() => buildStreakCalendar(completedSessionDates), [completedSessionDates]);
  const streak = useMemo(() => calculateStreak(completedSessionDates), [completedSessionDates]);
  const totalWorkouts = completedSessionDates.length;

  // Group into weeks for grid display (4 weeks × 7 days)
  const weeks: (typeof days[0] | null)[][] = [];
  // Pad start to align first week
  const firstDayDow = new Date(days[0]?.date || new Date()).getDay();
  const paddedDays: (typeof days[0] | null)[] = [
    ...Array(firstDayDow).fill(null),
    ...days,
  ];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
      {/* Header stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Workout Streak</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-sm font-bold text-orange-500">
            <Flame className="w-4 h-4" />
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
          <div className="flex items-center gap-1 text-sm font-bold text-violet-500">
            <Zap className="w-4 h-4" />
            {totalXP} XP
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div>
        {/* Day-of-week labels */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-gray-400 font-medium">{d}</div>
          ))}
        </div>

        {/* Week rows */}
        <div className="space-y-1">
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1">
              {week.map((day, di) => {
                if (!day) {
                  return <div key={di} className="h-7 rounded-md" />;
                }
                const intensity = day.hasWorkout ? 3 : 0;
                const isToday = day.date === new Date().toISOString().slice(0, 10);
                const isFuture = day.date > new Date().toISOString().slice(0, 10);
                return (
                  <div
                    key={day.date}
                    title={`${day.date}${day.hasWorkout ? ' · Workout ✓' : ''}`}
                    className={`h-7 rounded-md transition-all cursor-default ${
                      isFuture
                        ? 'bg-gray-50 dark:bg-gray-900/50 opacity-30'
                        : INTENSITY_COLORS[intensity]
                    } ${isToday ? 'ring-2 ring-orange-400 ring-offset-1' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 mt-3 justify-end">
          <span className="text-[10px] text-gray-400">Less</span>
          {INTENSITY_COLORS.slice(0, 4).map((cls, i) => (
            <div key={i} className={`w-3 h-3 rounded-sm ${cls}`} />
          ))}
          <span className="text-[10px] text-gray-400">More</span>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3 pt-1 border-t border-gray-100 dark:border-gray-700">
        {[
          { label: 'This Month', value: completedSessionDates.filter(d => d.slice(0, 7) === new Date().toISOString().slice(0, 7)).length, unit: 'sessions' },
          { label: 'Total Workouts', value: totalWorkouts, unit: 'all time' },
          { label: 'Best Streak', value: streak, unit: 'days' },
        ].map(({ label, value, unit }) => (
          <div key={label} className="text-center">
            <div className="text-lg font-black text-gray-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-gray-400 leading-tight">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
