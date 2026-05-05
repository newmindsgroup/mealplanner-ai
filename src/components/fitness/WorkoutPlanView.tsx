import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, Clock, Flame, Dumbbell, RefreshCw, Play, Calendar } from 'lucide-react';
import { generateWorkoutPlan } from '../../services/fitnessService';
import type { WorkoutPlan, WorkoutDay, FitnessProfile } from '../../services/fitnessService';

interface Props {
  plan: WorkoutPlan | null;
  profile: FitnessProfile | null;
  onPlanGenerated: (plan: WorkoutPlan) => void;
  onStartWorkout?: (day: WorkoutDay) => void; // Phase 9 hook
}

const INTENSITY_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-950/30 dark:text-green-400',
  moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400',
  high: 'bg-orange-100 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400',
  max: 'bg-red-100 text-red-700 dark:bg-red-950/30 dark:text-red-400',
};

const TYPE_EMOJI: Record<string, string> = {
  Push: '💪', Pull: '🔙', Legs: '🦵', 'Full Body': '🏋️', Upper: '👆', Lower: '👇',
  Cardio: '🏃', HIIT: '⚡', Yoga: '🧘', Mobility: '🤸', Rest: '😴', 'Active Recovery': '🚶',
};

// Determine if a day is "today"
function isTodayDay(dayOfWeek: string) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return days[new Date().getDay()] === dayOfWeek;
}

function DayCard({ day, onStartWorkout }: { day: WorkoutDay; onStartWorkout?: (day: WorkoutDay) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isRest = day.type === 'Rest' || day.type === 'Active Recovery';
  const isToday = isTodayDay(day.dayOfWeek);

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all ${
      isToday && !isRest
        ? 'border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20 shadow-md shadow-orange-100 dark:shadow-orange-900/20'
        : isRest
        ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40'
        : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
    }`}>
      <div className="flex items-center gap-3 p-4">
        {/* Day emoji */}
        <div className={`text-2xl flex-shrink-0 ${isToday && !isRest ? 'animate-bounce' : ''}`}>
          {TYPE_EMOJI[day.type] || '💪'}
        </div>

        {/* Day info */}
        <button className="flex-1 text-left min-w-0" onClick={() => !isRest && setExpanded(e => !e)}>
          <div className="flex items-center gap-2 mb-0.5">
            <span className={`text-xs font-black ${isToday ? 'text-orange-500' : 'text-gray-400'}`}>
              {day.dayOfWeek}{isToday ? ' · TODAY' : ''}
            </span>
            {day.intensity && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-lg font-bold ${INTENSITY_COLOR[day.intensity] || 'bg-gray-100 text-gray-600'}`}>
                {day.intensity}
              </span>
            )}
          </div>
          <p className={`font-bold text-sm leading-tight ${isRest ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
            {day.name}
          </p>
          {!isRest && (
            <p className="text-xs text-gray-400 mt-0.5">
              {day.duration_min} min · {day.exercises?.length || 0} exercises
            </p>
          )}
        </button>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {!isRest && onStartWorkout && (
            <button
              onClick={() => onStartWorkout(day)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isToday
                  ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-orange-300/40 hover:opacity-90'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-orange-100 dark:hover:bg-orange-950/30 hover:text-orange-600'
              }`}
            >
              <Play className="w-3 h-3" />
              {isToday ? 'Start' : 'Go'}
            </button>
          )}
          {!isRest && (
            <button onClick={() => setExpanded(e => !e)} className="p-1 text-gray-400 hover:text-gray-600">
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {expanded && !isRest && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 space-y-3 pt-3">
          {/* Warmup */}
          {day.warmup && day.warmup.length > 0 && (
            <div className="mb-2">
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-wider mb-1.5">🔥 Warmup</p>
              <div className="space-y-1">
                {day.warmup.map((w: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                    {w.exercise} — {w.duration}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises */}
          <div className="space-y-2">
            {day.exercises?.map((ex, i) => (
              <div key={i} className="flex gap-3 py-2 border-b border-gray-50 dark:border-gray-700/50 last:border-0">
                <div className="w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{ex.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5 flex-wrap">
                    <span className="font-semibold">{ex.sets} × {ex.reps}</span>
                    <span>Rest {ex.restSec}s</span>
                    {ex.rpe && <span>RPE {ex.rpe}</span>}
                    {ex.muscleGroups?.length > 0 && (
                      <span className="text-orange-500 font-medium">{ex.muscleGroups.slice(0, 2).join(' · ')}</span>
                    )}
                  </div>
                  {ex.technique && <p className="text-xs text-gray-400 mt-1 italic">💡 {ex.technique}</p>}
                  {ex.alternatives?.[0] && (
                    <p className="text-xs text-blue-500 mt-0.5">Alt: {ex.alternatives[0]}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Cooldown */}
          {day.cooldown && day.cooldown.length > 0 && (
            <div>
              <p className="text-[10px] font-black text-blue-500 uppercase tracking-wider mb-1.5">🧊 Cooldown</p>
              <div className="space-y-1">
                {day.cooldown.map((c: any, i: number) => (
                  <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                    <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                    {c.exercise} — {c.duration}
                  </div>
                ))}
              </div>
            </div>
          )}

          {day.recoveryMeal && (
            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-emerald-600 mb-1">🍽 Post-Workout Fuel</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{day.recoveryMeal}</p>
            </div>
          )}
          {day.coachNote && (
            <div className="p-2.5 bg-orange-50 dark:bg-orange-950/20 rounded-xl">
              <p className="text-xs text-orange-700 dark:text-orange-300 italic">🎯 {day.coachNote}</p>
            </div>
          )}

          {/* Start workout CTA at bottom of expanded card */}
          {onStartWorkout && (
            <button
              onClick={() => onStartWorkout(day)}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity mt-1 shadow-md shadow-orange-200/40"
            >
              <Play className="w-4 h-4" />
              Start This Workout
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkoutPlanView({ plan, profile, onPlanGenerated, onStartWorkout }: Props) {
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setGenerating(true);
    setError(null);
    try {
      const res = await generateWorkoutPlan();
      if (res.data) onPlanGenerated(res.data);
      else setError('Failed to generate plan. Try again.');
    } catch {
      setError('Generation failed. Please check your API key in Settings.');
    } finally {
      setGenerating(false);
    }
  };

  if (!profile) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 font-medium">Complete your fitness profile first</p>
      </div>
    );
  }

  // Find today's workout
  const todayWorkout = plan?.days?.find(d => isTodayDay(d.dayOfWeek) && d.type !== 'Rest' && d.type !== 'Active Recovery');

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {plan ? plan.planName : 'No Workout Plan Yet'}
          </h2>
          {plan?.weeklyFocus && <p className="text-sm text-gray-500 mt-0.5">{plan.weeklyFocus}</p>}
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60">
          {generating ? <><Zap className="w-4 h-4 animate-spin" /> Generating…</>
            : plan ? <><RefreshCw className="w-4 h-4" /> Regenerate</>
            : <><Zap className="w-4 h-4" /> Generate Plan</>}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl text-sm text-red-700 dark:text-red-400">{error}</div>
      )}

      {/* Today's hero card */}
      {todayWorkout && onStartWorkout && (
        <div className="relative bg-gradient-to-br from-orange-500 to-rose-600 rounded-2xl p-5 overflow-hidden shadow-lg shadow-orange-200/50 dark:shadow-orange-900/30">
          <div className="absolute top-0 right-0 text-8xl opacity-10 leading-none -mt-2 -mr-2">💪</div>
          <p className="text-orange-100 text-xs font-bold uppercase tracking-wider mb-1">Today's Session</p>
          <h3 className="text-white font-black text-lg leading-tight mb-0.5">{todayWorkout.name}</h3>
          <p className="text-orange-200 text-sm mb-4">{todayWorkout.duration_min} min · {todayWorkout.exercises?.length || 0} exercises</p>
          <button
            onClick={() => onStartWorkout(todayWorkout)}
            className="flex items-center gap-2 bg-white text-orange-600 font-black px-5 py-2.5 rounded-xl text-sm hover:bg-orange-50 transition-colors shadow-md">
            <Play className="w-4 h-4" />
            Start Workout Now
          </button>
        </div>
      )}

      {plan && !generating ? (
        <>
          {plan.totalWeeklyVolume && (
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Weekly Volume', value: plan.totalWeeklyVolume, icon: Dumbbell },
                { label: 'Sessions', value: `${plan.days?.filter(d => d.type !== 'Rest').length || 0}/week`, icon: Flame },
                { label: 'Deload Week', value: plan.deloadWeek ? 'Yes ✓' : 'No', icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                  <Icon className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-black text-gray-900 dark:text-white truncate">{value}</p>
                  <p className="text-[10px] text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {plan.days?.map((day, i) => (
              <DayCard key={i} day={day} onStartWorkout={onStartWorkout} />
            ))}
          </div>

          {plan.progressionStrategy && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
              <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-1">📈 Progression Strategy</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{plan.progressionStrategy}</p>
            </div>
          )}

          {plan.weeklyRecoveryTips && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">🌙 Recovery Tips</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{plan.weeklyRecoveryTips}</p>
            </div>
          )}
        </>
      ) : !generating ? (
        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-2xl p-12 text-center">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-2">Generate your personalized AI workout plan</p>
          <p className="text-gray-400 text-sm mb-5">The AI will use your goals, equipment, training style, and blood type to build the perfect weekly plan</p>
          <button onClick={handleGenerate}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity">
            Generate My Plan
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-center h-40 text-gray-500">
          <div className="text-center">
            <Zap className="w-8 h-8 text-orange-500 mx-auto mb-2 animate-pulse" />
            <p className="text-sm font-medium">Building your personalized plan…</p>
            <p className="text-xs text-gray-400 mt-1">Analyzing your goals, equipment & blood type</p>
          </div>
        </div>
      )}
    </div>
  );
}
