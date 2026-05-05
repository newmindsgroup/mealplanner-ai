/**
 * CircadianMealTimer — Phase 10 Batch B
 * Recommends optimal meal windows based on wake time + workout schedule.
 */
import React, { useState, useMemo } from 'react';
import { Clock, Sun, Moon, Dumbbell, Coffee, Utensils, Sunset, AlertCircle } from 'lucide-react';

interface MealWindow { time: string; label: string; emoji: string; description: string; color: string; }

function computeWindows(wakeHour: number, workoutHour: number | null, fastingHours: number): MealWindow[] {
  const fmt = (h: number) => { const hr = ((h % 24) + 24) % 24; const ap = hr >= 12 ? 'PM' : 'AM'; return `${hr % 12 || 12}:00 ${ap}`; };
  const windows: MealWindow[] = [];
  const eatingStart = wakeHour + (fastingHours > 0 ? fastingHours : 1);
  const eatingEnd = eatingStart + (fastingHours > 0 ? (24 - fastingHours) : 14);

  // Morning hydration
  windows.push({ time: fmt(wakeHour), label: 'Hydrate', emoji: '💧', description: '500ml water + electrolytes on waking', color: 'from-blue-400 to-cyan-500' });

  // Pre-workout (if before first meal)
  if (workoutHour !== null && workoutHour < eatingStart) {
    windows.push({ time: fmt(workoutHour - 1), label: 'Pre-Workout', emoji: '🍌', description: 'Light carb: banana or rice cake. Easy to digest.', color: 'from-amber-400 to-orange-500' });
  }

  // First meal
  windows.push({ time: fmt(eatingStart), label: 'First Meal', emoji: '🍳', description: 'Protein + healthy fats + complex carbs. Break your fast intentionally.', color: 'from-emerald-400 to-teal-500' });

  // Pre-workout meal (if during eating window)
  if (workoutHour !== null && workoutHour >= eatingStart && workoutHour <= eatingEnd) {
    windows.push({ time: fmt(workoutHour - 1), label: 'Pre-Workout', emoji: '⚡', description: 'Carbs + moderate protein 60–90 min before. Low fat for fast digestion.', color: 'from-orange-400 to-rose-500' });
    windows.push({ time: fmt(workoutHour), label: 'Workout', emoji: '🏋️', description: 'Training session. Sip water throughout.', color: 'from-violet-400 to-purple-500' });
    windows.push({ time: fmt(workoutHour + 1), label: 'Post-Workout', emoji: '🥩', description: 'Protein + fast carbs within 30–60 min. Recovery window.', color: 'from-rose-400 to-pink-500' });
  }

  // Mid-day meal
  const midDay = Math.round(eatingStart + (eatingEnd - eatingStart) * 0.5);
  if (!workoutHour || Math.abs(midDay - workoutHour) > 2) {
    windows.push({ time: fmt(midDay), label: 'Main Meal', emoji: '🥗', description: 'Largest meal. Balanced macros — protein, carbs, vegetables.', color: 'from-green-400 to-emerald-500' });
  }

  // Last meal
  windows.push({ time: fmt(eatingEnd - 1), label: 'Last Meal', emoji: '🍲', description: 'Lighter. Protein + vegetables. Minimize heavy carbs before bed.', color: 'from-indigo-400 to-violet-500' });

  // Wind down
  windows.push({ time: fmt(eatingEnd), label: 'Eating Window Closes', emoji: '🌙', description: 'Stop eating. Herbal tea okay. Begin overnight fast.', color: 'from-gray-400 to-gray-500' });

  return windows.sort((a, b) => {
    const ha = parseInt(a.time); const hb = parseInt(b.time);
    return ha - hb;
  });
}

export default function CircadianMealTimer() {
  const [wakeTime, setWakeTime] = useState(7);
  const [workoutTime, setWorkoutTime] = useState<number | null>(17);
  const [fastingHours, setFastingHours] = useState(0); // 0 = no IF, 14/16/18/20
  const [showWorkout, setShowWorkout] = useState(true);

  const windows = useMemo(
    () => computeWindows(wakeTime, showWorkout ? workoutTime : null, fastingHours),
    [wakeTime, workoutTime, fastingHours, showWorkout]
  );

  const fmt12 = (h: number) => { const hr = ((h % 24) + 24) % 24; const ap = hr >= 12 ? 'PM' : 'AM'; return `${hr % 12 || 12} ${ap}`; };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <Sun className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Circadian Meal Timer</h2>
          <p className="text-[11px] text-gray-400">Optimize meal timing for energy & recovery</p>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-xs font-bold text-gray-500">☀️ Wake Time</span>
            <span className="text-xs font-black text-gray-900 dark:text-white">{fmt12(wakeTime)}</span>
          </div>
          <input type="range" min={4} max={11} value={wakeTime} onChange={e => setWakeTime(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500" />
        </div>

        <div className="flex items-center gap-2">
          <input type="checkbox" checked={showWorkout} onChange={e => setShowWorkout(e.target.checked)}
            className="w-4 h-4 accent-orange-500 rounded" />
          <span className="text-xs text-gray-500 font-semibold">Include workout timing</span>
        </div>

        {showWorkout && (
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-xs font-bold text-gray-500">🏋️ Workout Time</span>
              <span className="text-xs font-black text-gray-900 dark:text-white">{fmt12(workoutTime || 17)}</span>
            </div>
            <input type="range" min={5} max={22} value={workoutTime || 17} onChange={e => setWorkoutTime(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-violet-500" />
          </div>
        )}

        <div>
          <p className="text-xs font-bold text-gray-500 mb-1.5">⏱️ Intermittent Fasting</p>
          <div className="flex gap-1.5">
            {[{ label: 'None', val: 0 }, { label: '14:10', val: 14 }, { label: '16:8', val: 16 }, { label: '18:6', val: 18 }, { label: '20:4', val: 20 }].map(f => (
              <button key={f.val} onClick={() => setFastingHours(f.val)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${fastingHours === f.val ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="space-y-0">
        {windows.map((w, i) => (
          <div key={i} className="flex gap-3 relative">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${w.color} flex items-center justify-center text-base z-10 shadow-md`}>
                {w.emoji}
              </div>
              {i < windows.length - 1 && <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 min-h-[20px]" />}
            </div>
            {/* Content */}
            <div className="pb-4 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-gray-900 dark:text-white">{w.label}</span>
                <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-1.5 py-0.5 rounded-lg font-semibold">{w.time}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{w.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Info */}
      {fastingHours > 0 && (
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> IF Note</p>
          <p className="text-xs text-amber-600/80 dark:text-amber-400/60 mt-0.5">
            {fastingHours}:{24 - fastingHours} fasting. Your eating window is {24 - fastingHours} hours.
            Ensure total daily protein and calories are met within this window.
          </p>
        </div>
      )}
    </div>
  );
}
