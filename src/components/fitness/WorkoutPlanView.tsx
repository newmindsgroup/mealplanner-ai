import React, { useState } from 'react';
import { Zap, ChevronDown, ChevronUp, Clock, Flame, Dumbbell, RefreshCw } from 'lucide-react';
import { generateWorkoutPlan } from '../../services/fitnessService';
import type { WorkoutPlan, WorkoutDay, FitnessProfile } from '../../services/fitnessService';

interface Props {
  plan: WorkoutPlan | null;
  profile: FitnessProfile | null;
  onPlanGenerated: (plan: WorkoutPlan) => void;
}

const INTENSITY_COLOR: Record<string, string> = {
  low: 'bg-green-100 text-green-700',
  moderate: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700',
  max: 'bg-red-100 text-red-700',
};

const TYPE_EMOJI: Record<string, string> = {
  Push: '💪', Pull: '🔙', Legs: '🦵', 'Full Body': '🏋️', Upper: '👆', Lower: '👇',
  Cardio: '🏃', HIIT: '⚡', Yoga: '🧘', Mobility: '🤸', Rest: '😴', 'Active Recovery': '🚶',
};

function DayCard({ day }: { day: WorkoutDay }) {
  const [expanded, setExpanded] = useState(false);
  const isRest = day.type === 'Rest' || day.type === 'Active Recovery';

  return (
    <div className={`rounded-xl border overflow-hidden transition-all ${isRest ? 'border-gray-100 bg-gray-50 dark:bg-gray-800/50' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
      <button className="w-full flex items-center gap-3 p-4 text-left" onClick={() => !isRest && setExpanded(e => !e)}>
        <div className="text-2xl">{TYPE_EMOJI[day.type] || '💪'}</div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-bold text-gray-400">{day.dayOfWeek}</span>
            {day.intensity && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-semibold ${INTENSITY_COLOR[day.intensity] || 'bg-gray-100 text-gray-600'}`}>
                {day.intensity}
              </span>
            )}
          </div>
          <p className={`font-bold text-sm ${isRest ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>{day.name}</p>
          {!isRest && (
            <p className="text-xs text-gray-400">
              {day.duration_min} min · {day.exercises?.length || 0} exercises
            </p>
          )}
        </div>
        {!isRest && (
          expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {expanded && !isRest && (
        <div className="border-t border-gray-100 dark:border-gray-700 px-4 pb-4 space-y-3">
          {day.exercises?.map((ex, i) => (
            <div key={i} className="flex gap-3 py-2">
              <div className="w-6 h-6 rounded-full bg-orange-100 text-orange-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </div>
              <div className="flex-1">
                <p className="font-bold text-sm text-gray-900 dark:text-white">{ex.name}</p>
                <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                  <span>{ex.sets} × {ex.reps}</span>
                  <span>Rest {ex.restSec}s</span>
                  {ex.rpe && <span>RPE {ex.rpe}</span>}
                </div>
                {ex.technique && <p className="text-xs text-gray-400 mt-1 italic">{ex.technique}</p>}
                {ex.alternatives?.[0] && (
                  <p className="text-xs text-blue-500 mt-0.5">Alt: {ex.alternatives[0]}</p>
                )}
              </div>
            </div>
          ))}

          {day.recoveryMeal && (
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <p className="text-xs font-bold text-emerald-600 mb-1">🍽 Post-Workout Recovery</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">{day.recoveryMeal}</p>
            </div>
          )}
          {day.coachNote && (
            <div className="mt-2 p-2 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-xs text-orange-700 dark:text-orange-300 italic">{day.coachNote}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function WorkoutPlanView({ plan, profile, onPlanGenerated }: Props) {
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

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            {plan ? plan.planName : 'No Workout Plan Yet'}
          </h2>
          {plan?.weeklyFocus && <p className="text-sm text-gray-500">{plan.weeklyFocus}</p>}
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold px-4 py-2 rounded-xl text-sm hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-60">
          {generating ? <><Zap className="w-4 h-4 animate-spin" /> Generating…</>
            : plan ? <><RefreshCw className="w-4 h-4" /> Regenerate</>
            : <><Zap className="w-4 h-4" /> Generate Plan</>}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
      )}

      {plan && !generating ? (
        <>
          {plan.totalWeeklyVolume && (
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Weekly Volume', value: plan.totalWeeklyVolume, icon: Dumbbell },
                { label: 'Sessions', value: `${plan.days?.filter(d => d.type !== 'Rest').length || 0}/week`, icon: Flame },
                { label: 'Deload Week', value: plan.deloadWeek ? 'Yes' : 'No', icon: Clock },
              ].map(({ label, value, icon: Icon }) => (
                <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                  <Icon className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-xs font-black text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          )}

          <div className="space-y-2">
            {plan.days?.map((day, i) => <DayCard key={i} day={day} />)}
          </div>

          {plan.progressionStrategy && (
            <div className="p-4 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-orange-950/20 dark:to-rose-950/20 rounded-xl border border-orange-100 dark:border-orange-900/30">
              <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-1">📈 Progression Strategy</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{plan.progressionStrategy}</p>
            </div>
          )}
        </>
      ) : !generating ? (
        <div className="border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium mb-4">Generate your personalized AI workout plan</p>
          <p className="text-gray-400 text-sm mb-5">The AI will use your goals, equipment, training style, and blood type to build the perfect weekly plan</p>
          <button onClick={handleGenerate}
            className="bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold px-6 py-3 rounded-xl hover:from-orange-600 hover:to-rose-600 transition-all">
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
