import React, { useEffect, useState } from 'react';
import { Dumbbell, Flame, Clock, ChevronRight, Zap } from 'lucide-react';
import { getCurrentWorkoutPlan } from '../../services/fitnessService';
import type { WorkoutDay } from '../../services/fitnessService';

const INTENSITY_GRADIENT: Record<string, string> = {
  low: 'from-green-400 to-emerald-500',
  moderate: 'from-yellow-400 to-orange-400',
  high: 'from-orange-500 to-rose-500',
  max: 'from-rose-500 to-red-600',
};

const TYPE_EMOJI: Record<string, string> = {
  Push: '💪', Pull: '🔙', Legs: '🦵', 'Full Body': '🏋️', Upper: '👆', Lower: '👇',
  Cardio: '🏃', HIIT: '⚡', Yoga: '🧘', Mobility: '🤸', Rest: '😴', 'Active Recovery': '🚶',
};

interface Props {
  dayName: string; // e.g. "Monday"
  onNavigateToFitness?: () => void;
}

export default function WorkoutDayCard({ dayName, onNavigateToFitness }: Props) {
  const [workout, setWorkout] = useState<WorkoutDay | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentWorkoutPlan()
      .then(res => {
        const day = res.data?.days?.find(d => d.dayOfWeek === dayName);
        setWorkout(day || null);
      })
      .catch(() => setWorkout(null))
      .finally(() => setLoading(false));
  }, [dayName]);

  if (loading) return null;

  // No plan or rest day — subtle placeholder
  if (!workout || workout.type === 'Rest') {
    return (
      <div className="mt-3 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-3 flex items-center gap-2 text-gray-400 dark:text-gray-600 text-xs">
        <Dumbbell className="w-3.5 h-3.5 flex-shrink-0" />
        {!workout ? (
          <button onClick={onNavigateToFitness} className="hover:text-orange-500 transition-colors truncate">
            Set up your workout plan →
          </button>
        ) : (
          <span>Rest day 😴 — recover well!</span>
        )}
      </div>
    );
  }

  const isRest = workout.type === 'Rest' || workout.type === 'Active Recovery';
  const gradient = INTENSITY_GRADIENT[workout.intensity || 'moderate'];

  return (
    <button
      onClick={onNavigateToFitness}
      className="mt-3 w-full text-left rounded-xl overflow-hidden border border-orange-200/60 dark:border-orange-900/30 hover:shadow-md transition-all group"
    >
      {/* Gradient header strip */}
      <div className={`bg-gradient-to-r ${gradient} px-3 py-1.5 flex items-center justify-between`}>
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{TYPE_EMOJI[workout.type] || '🏋️'}</span>
          <span className="text-white text-xs font-bold">{workout.name}</span>
        </div>
        <ChevronRight className="w-3 h-3 text-white/70 group-hover:translate-x-0.5 transition-transform" />
      </div>

      {/* Exercise preview */}
      <div className="bg-orange-50/80 dark:bg-orange-950/10 px-3 py-2">
        <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-orange-500" />
            {workout.duration_min}min
          </span>
          <span className="flex items-center gap-1">
            <Dumbbell className="w-3 h-3 text-orange-500" />
            {workout.exercises?.length || 0} exercises
          </span>
          {workout.intensity && (
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              {workout.intensity}
            </span>
          )}
        </div>

        {/* First 2 exercises preview */}
        {workout.exercises?.slice(0, 2).map((ex, i) => (
          <p key={i} className="text-xs text-gray-500 dark:text-gray-500 mt-1 truncate">
            · {ex.name} — {ex.sets}×{ex.reps}
          </p>
        ))}
        {(workout.exercises?.length || 0) > 2 && (
          <p className="text-xs text-orange-500 mt-0.5">
            +{(workout.exercises?.length || 0) - 2} more exercises
          </p>
        )}

        {/* Recovery meal hint */}
        {workout.recoveryMeal && (
          <p className="text-xs text-emerald-600 mt-1.5 truncate">
            🍽 Post-workout: {workout.recoveryMeal.split(',')[0]}
          </p>
        )}
      </div>
    </button>
  );
}
