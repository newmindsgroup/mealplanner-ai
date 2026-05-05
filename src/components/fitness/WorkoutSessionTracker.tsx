/**
 * WorkoutSessionTracker — Real-time active workout mode.
 * Timer, exercise checklist, per-set weight/reps logging.
 * On finish → feeds into SessionCompleteModal data.
 * Phase 9 feature.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Play, Pause, StopCircle, CheckCircle, ChevronDown, ChevronUp,
  Plus, Minus, Timer, Flame, Dumbbell, X, Trophy, Zap,
} from 'lucide-react';
import type { WorkoutDay } from '../../services/fitnessService';
import { completeSession } from '../../services/fitnessService';

interface SetLog {
  weight?: number;
  reps?: number;
  duration?: string;
  done: boolean;
}

interface ExerciseState {
  name: string;
  targetSets: number;
  targetReps: string;
  muscleGroups: string[];
  restSec: number;
  sets: SetLog[];
  expanded: boolean;
  restTimer: number; // seconds remaining in rest
  resting: boolean;
}

interface Props {
  session: WorkoutDay;
  sessionId?: string;
  personId?: string;
  onFinish: (summary: { duration: number; completedSets: number; exercises: ExerciseState[] }) => void;
  onCancel: () => void;
}

function fmt(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

export default function WorkoutSessionTracker({ session, sessionId, personId, onFinish, onCancel }: Props) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(true);
  const [exercises, setExercises] = useState<ExerciseState[]>(() =>
    (session.exercises || []).map(ex => ({
      name: ex.name,
      targetSets: ex.sets || 3,
      targetReps: typeof ex.reps === 'string' ? ex.reps : String(ex.reps || '10'),
      muscleGroups: ex.muscleGroups || [],
      restSec: ex.restSec || 90,
      sets: Array.from({ length: ex.sets || 3 }, () => ({ done: false })),
      expanded: false,
      restTimer: 0,
      resting: false,
    }))
  );
  const [finishing, setFinishing] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const restRefs = useRef<Record<number, ReturnType<typeof setInterval>>>({});

  // Main workout timer
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  // Per-exercise rest timers
  const startRest = useCallback((exIdx: number) => {
    const restSec = exercises[exIdx].restSec;
    setExercises(prev => prev.map((e, i) => i === exIdx ? { ...e, resting: true, restTimer: restSec } : e));
    const id = setInterval(() => {
      setExercises(prev => {
        const updated = prev.map((e, i) => {
          if (i !== exIdx || !e.resting) return e;
          const next = e.restTimer - 1;
          if (next <= 0) {
            clearInterval(restRefs.current[exIdx]);
            return { ...e, resting: false, restTimer: 0 };
          }
          return { ...e, restTimer: next };
        });
        return updated;
      });
    }, 1000);
    restRefs.current[exIdx] = id;
  }, [exercises]);

  const toggleSet = (exIdx: number, setIdx: number) => {
    setExercises(prev => {
      const updated = prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const wasNotDone = !ex.sets[setIdx].done;
        const newSets = ex.sets.map((s, si) => si === setIdx ? { ...s, done: !s.done } : s);
        // Start rest timer when marking done
        if (wasNotDone && setIdx < ex.sets.length - 1) {
          setTimeout(() => startRest(exIdx), 50);
        }
        return { ...ex, sets: newSets };
      });
      return updated;
    });
  };

  const updateSet = (exIdx: number, setIdx: number, field: 'weight' | 'reps', val: string) => {
    setExercises(prev => prev.map((ex, i) =>
      i !== exIdx ? ex : {
        ...ex,
        sets: ex.sets.map((s, si) =>
          si !== setIdx ? s : { ...s, [field]: val === '' ? undefined : Number(val) }
        ),
      }
    ));
  };

  const toggleExpand = (idx: number) =>
    setExercises(prev => prev.map((e, i) => i === idx ? { ...e, expanded: !e.expanded } : e));

  const totalSets = exercises.reduce((s, e) => s + e.sets.length, 0);
  const doneSets = exercises.reduce((s, e) => s + e.sets.filter(st => st.done).length, 0);
  const allDone = doneSets === totalSets;
  const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;

  const handleFinish = () => {
    setRunning(false);
    onFinish({ duration: Math.round(elapsed / 60), completedSets: doneSets, exercises });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-950 flex flex-col overflow-hidden">
      {/* Header bar */}
      <div className="flex-shrink-0 bg-gradient-to-r from-orange-600 to-rose-600 px-4 pt-safe pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-orange-200 text-xs font-semibold uppercase tracking-wider">{session.type}</p>
            <h2 className="text-white font-black text-lg leading-tight">{session.name}</h2>
          </div>
          <button onClick={onCancel} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30">
            <X className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Timer + progress */}
        <div className="flex items-center gap-4">
          <button onClick={() => setRunning(r => !r)}
            className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-xl text-sm font-bold transition-all">
            {running ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="font-mono text-base">{fmt(elapsed)}</span>
          </button>
          <div className="flex-1">
            <div className="flex justify-between text-xs text-orange-200 mb-0.5">
              <span>{doneSets}/{totalSets} sets</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-300" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Exercise list */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {exercises.map((ex, exIdx) => {
          const exDone = ex.sets.every(s => s.done);
          const exPct = ex.sets.length > 0 ? Math.round((ex.sets.filter(s => s.done).length / ex.sets.length) * 100) : 0;

          return (
            <div key={exIdx} className={`rounded-2xl overflow-hidden border transition-all ${exDone ? 'border-emerald-700 bg-emerald-950/30' : 'border-gray-800 bg-gray-900'}`}>
              {/* Exercise header */}
              <button onClick={() => toggleExpand(exIdx)} className="w-full flex items-center gap-3 p-4 text-left">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${exDone ? 'bg-emerald-500' : 'bg-gray-800'}`}>
                  {exDone ? <CheckCircle className="w-5 h-5 text-white" /> : <Dumbbell className="w-4 h-4 text-gray-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white text-sm">{ex.name}</p>
                  <p className="text-xs text-gray-500">{ex.muscleGroups.slice(0, 2).join(' · ')} · {ex.targetSets} sets × {ex.targetReps}</p>
                  <div className="h-1 bg-gray-800 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-orange-500 rounded-full transition-all" style={{ width: `${exPct}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {ex.resting && (
                    <div className="flex items-center gap-1 bg-blue-900/50 text-blue-400 px-2 py-1 rounded-lg">
                      <Timer className="w-3 h-3" />
                      <span className="text-xs font-mono font-bold">{fmt(ex.restTimer)}</span>
                    </div>
                  )}
                  {ex.expanded ? <ChevronUp className="w-4 h-4 text-gray-600" /> : <ChevronDown className="w-4 h-4 text-gray-600" />}
                </div>
              </button>

              {/* Sets */}
              {ex.expanded && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-800 pt-3">
                  {/* Column labels */}
                  <div className="grid grid-cols-[40px_1fr_1fr_44px] gap-2 text-xs text-gray-600 font-semibold px-1">
                    <span>Set</span><span>Weight (kg)</span><span>Reps</span><span>Done</span>
                  </div>
                  {ex.sets.map((set, setIdx) => (
                    <div key={setIdx} className={`grid grid-cols-[40px_1fr_1fr_44px] gap-2 items-center rounded-xl px-1 py-1 ${set.done ? 'bg-emerald-950/40' : ''}`}>
                      <span className="text-xs font-bold text-gray-500">#{setIdx + 1}</span>
                      <input
                        type="number"
                        placeholder="—"
                        value={set.weight ?? ''}
                        onChange={e => updateSet(exIdx, setIdx, 'weight', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                      />
                      <input
                        type="number"
                        placeholder={ex.targetReps.split('-')[0] || '10'}
                        value={set.reps ?? ''}
                        onChange={e => updateSet(exIdx, setIdx, 'reps', e.target.value)}
                        className="bg-gray-800 border border-gray-700 rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:ring-2 focus:ring-orange-500 w-full"
                      />
                      <button onClick={() => toggleSet(exIdx, setIdx)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${set.done ? 'bg-emerald-500 text-white' : 'bg-gray-800 text-gray-600 hover:bg-gray-700'}`}>
                        <CheckCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}

                  {/* Rest timer prompt */}
                  {ex.resting && (
                    <div className="flex items-center gap-2 bg-blue-950/50 border border-blue-900/50 rounded-xl px-3 py-2 mt-1">
                      <Timer className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-blue-300 font-semibold">Resting… {fmt(ex.restTimer)}</span>
                      <button onClick={() => {
                        if (restRefs.current[exIdx]) clearInterval(restRefs.current[exIdx]);
                        setExercises(prev => prev.map((e, i) => i === exIdx ? { ...e, resting: false, restTimer: 0 } : e));
                      }} className="ml-auto text-xs text-blue-400 hover:text-blue-200">Skip</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

        {/* Warmup block if available */}
        {session.warmup && session.warmup.length > 0 && (
          <div className="rounded-2xl border border-amber-900/50 bg-amber-950/20 p-4">
            <p className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5" /> Warmup
            </p>
            <div className="space-y-1">
              {session.warmup.map((w: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-xs text-amber-200/70">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-600 flex-shrink-0" />
                  <span>{w.exercise} — {w.duration}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bottom action bar */}
      <div className="flex-shrink-0 bg-gray-900 border-t border-gray-800 p-4 pb-safe pb-6">
        {allDone && (
          <div className="flex items-center gap-2 mb-3 bg-emerald-950/50 border border-emerald-900/50 rounded-xl px-3 py-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-bold">All sets complete! Great work! 🎉</span>
          </div>
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 border border-gray-700 text-gray-400 font-bold py-3 rounded-xl text-sm hover:border-gray-600">
            Cancel
          </button>
          <button onClick={handleFinish} disabled={finishing}
            className="flex-2 flex-grow-[2] flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-black py-3 rounded-xl text-sm hover:opacity-90 transition-opacity shadow-lg shadow-orange-900/30">
            <Zap className="w-4 h-4" />
            {allDone ? 'Finish Workout 🏆' : `Finish Early (${doneSets}/${totalSets})`}
          </button>
        </div>
      </div>
    </div>
  );
}
