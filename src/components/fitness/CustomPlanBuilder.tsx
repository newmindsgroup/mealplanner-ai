/**
 * CustomPlanBuilder — Click-to-assign weekly workout schedule builder.
 * Phase 8 feature. Users pick exercises from a mini library panel and
 * assign them to day slots. Saves as a custom workout_plan.
 */
import React, { useState, useMemo } from 'react';
import { Plus, X, Save, Zap, Dumbbell, Heart, Loader2, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/apiClient';
import type { WorkoutPlan } from '../../services/fitnessService';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const SESSION_TYPES = [
  'Push', 'Pull', 'Legs', 'Full Body', 'Upper', 'Lower',
  'Cardio', 'HIIT', 'Yoga', 'Mobility', 'Rest', 'Active Recovery',
];

interface Exercise {
  id: string;
  name: string;
  muscles: string[];
  category: string;
  sets: string;
  reps: string;
  equipment: string[];
}

const QUICK_EXERCISES: Exercise[] = [
  { id: 'bp', name: 'Bench Press', muscles: ['Chest', 'Triceps'], category: 'Chest', sets: '3', reps: '8-10', equipment: ['Barbell'] },
  { id: 'squat', name: 'Back Squat', muscles: ['Quads', 'Glutes'], category: 'Legs', sets: '4', reps: '5-8', equipment: ['Barbell'] },
  { id: 'deadlift', name: 'Deadlift', muscles: ['Back', 'Glutes'], category: 'Back', sets: '3', reps: '4-6', equipment: ['Barbell'] },
  { id: 'ohp', name: 'Overhead Press', muscles: ['Shoulders'], category: 'Shoulders', sets: '3', reps: '6-8', equipment: ['Barbell'] },
  { id: 'pullup', name: 'Pull-Up', muscles: ['Lats', 'Biceps'], category: 'Back', sets: '3', reps: '5-10', equipment: [] },
  { id: 'pushup', name: 'Push-Up', muscles: ['Chest', 'Triceps'], category: 'Chest', sets: '3', reps: '12-20', equipment: [] },
  { id: 'rdl', name: 'Romanian Deadlift', muscles: ['Hamstrings', 'Glutes'], category: 'Legs', sets: '3', reps: '10-12', equipment: ['Barbell'] },
  { id: 'row', name: 'Barbell Row', muscles: ['Back', 'Biceps'], category: 'Back', sets: '3', reps: '8-10', equipment: ['Barbell'] },
  { id: 'lat-pd', name: 'Lat Pulldown', muscles: ['Lats'], category: 'Back', sets: '3', reps: '10-12', equipment: ['Cable machines'] },
  { id: 'dip', name: 'Dips', muscles: ['Triceps', 'Chest'], category: 'Arms', sets: '3', reps: '10-15', equipment: [] },
  { id: 'curl', name: 'Barbell Curl', muscles: ['Biceps'], category: 'Arms', sets: '3', reps: '10-12', equipment: ['Barbell'] },
  { id: 'lunge', name: 'Walking Lunge', muscles: ['Quads', 'Glutes'], category: 'Legs', sets: '3', reps: '12/side', equipment: [] },
  { id: 'plank', name: 'Plank', muscles: ['Core'], category: 'Core', sets: '3', reps: '45 sec', equipment: [] },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', muscles: ['Core'], category: 'Core', sets: '3', reps: '10', equipment: [] },
  { id: 'run', name: 'Running', muscles: ['Full Body'], category: 'Cardio', sets: '1', reps: '20-40 min', equipment: [] },
  { id: 'kb-swing', name: 'Kettlebell Swing', muscles: ['Glutes', 'Core'], category: 'Cardio', sets: '4', reps: '15-20', equipment: ['Kettlebells'] },
  { id: 'lateral', name: 'Lateral Raise', muscles: ['Side Delts'], category: 'Shoulders', sets: '3', reps: '12-15', equipment: ['Dumbbells'] },
  { id: 'face-pull', name: 'Face Pull', muscles: ['Rear Delts'], category: 'Shoulders', sets: '3', reps: '15-20', equipment: ['Resistance bands'] },
  { id: 'calf', name: 'Calf Raise', muscles: ['Calves'], category: 'Legs', sets: '4', reps: '20-25', equipment: [] },
  { id: 'goblet', name: 'Goblet Squat', muscles: ['Quads', 'Core'], category: 'Legs', sets: '3', reps: '12-15', equipment: ['Kettlebells'] },
];

const EX_CATEGORIES = ['All', ...Array.from(new Set(QUICK_EXERCISES.map(e => e.category)))];

interface DayPlan {
  type: string;
  exercises: (Exercise & { customSets?: string; customReps?: string })[];
  note: string;
}

interface Props {
  personId?: string;
  personName?: string;
  onPlanSaved?: (plan: WorkoutPlan) => void;
}

function ExercisePill({ ex, onRemove, onEdit }: {
  ex: Exercise & { customSets?: string; customReps?: string };
  onRemove: () => void;
  onEdit: (field: 'customSets' | 'customReps', val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="bg-orange-50 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-2.5 py-1.5">
        <span className="text-xs font-semibold text-gray-800 dark:text-white flex-1 truncate">{ex.name}</span>
        <span className="text-[10px] text-orange-600 font-bold">{ex.customSets || ex.sets}×{ex.customReps || ex.reps}</span>
        <button onClick={() => setOpen(o => !o)} className="text-gray-400 hover:text-orange-600">
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>
        <button onClick={onRemove} className="text-gray-300 hover:text-rose-500">
          <X className="w-3 h-3" />
        </button>
      </div>
      {open && (
        <div className="flex gap-2 px-2.5 pb-2">
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-0.5">Sets</p>
            <input type="text" value={ex.customSets || ex.sets}
              onChange={e => onEdit('customSets', e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 mb-0.5">Reps</p>
            <input type="text" value={ex.customReps || ex.reps}
              onChange={e => onEdit('customReps', e.target.value)}
              className="w-full text-xs border border-gray-200 dark:border-gray-600 rounded-lg px-1.5 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomPlanBuilder({ personId, personName, onPlanSaved }: Props) {
  const [days, setDays] = useState<Record<string, DayPlan>>(() =>
    Object.fromEntries(DAYS.map(d => [d, { type: d === 'Sunday' ? 'Rest' : 'Full Body', exercises: [], note: '' }]))
  );
  const [planName, setPlanName] = useState('My Custom Plan');
  const [activeDay, setActiveDay] = useState('Monday');
  const [exCategory, setExCategory] = useState('All');
  const [exSearch, setExSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const filteredEx = useMemo(() =>
    QUICK_EXERCISES.filter(e =>
      (exCategory === 'All' || e.category === exCategory) &&
      (!exSearch || e.name.toLowerCase().includes(exSearch.toLowerCase()))
    ), [exCategory, exSearch]);

  const addExercise = (ex: Exercise) => {
    setDays(d => ({
      ...d,
      [activeDay]: {
        ...d[activeDay],
        exercises: d[activeDay].exercises.some(e => e.id === ex.id)
          ? d[activeDay].exercises
          : [...d[activeDay].exercises, { ...ex }],
      },
    }));
  };

  const removeExercise = (day: string, id: string) =>
    setDays(d => ({ ...d, [day]: { ...d[day], exercises: d[day].exercises.filter(e => e.id !== id) } }));

  const editExercise = (day: string, id: string, field: 'customSets' | 'customReps', val: string) =>
    setDays(d => ({
      ...d,
      [day]: { ...d[day], exercises: d[day].exercises.map(e => e.id === id ? { ...e, [field]: val } : e) },
    }));

  const setDayType = (day: string, type: string) =>
    setDays(d => ({ ...d, [day]: { ...d[day], type } }));

  const setDayNote = (day: string, note: string) =>
    setDays(d => ({ ...d, [day]: { ...d[day], note } }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const planData = {
        planName,
        weeklyFocus: 'Custom Plan',
        totalWeeklyVolume: `${Object.values(days).reduce((s, d) => s + d.exercises.length, 0)} exercises total`,
        progressionStrategy: 'Add weight or reps each week when you hit the top of the rep range',
        days: DAYS.map(dayName => {
          const day = days[dayName];
          return {
            dayOfWeek: dayName,
            type: day.type,
            name: day.type === 'Rest' ? 'Rest Day' : `${dayName} — ${day.type}`,
            scheduledTime: 'morning',
            duration_min: day.exercises.length * 8 + 15,
            intensity: day.exercises.length === 0 ? 'low' : 'moderate',
            exercises: day.exercises.map(e => ({
              name: e.name,
              muscleGroups: e.muscles,
              sets: parseInt(e.customSets || e.sets) || 3,
              reps: e.customReps || e.reps,
              restSec: 90,
              rpe: 7,
              technique: '',
              alternatives: [],
            })),
            warmup: [],
            cooldown: [],
            coachNote: day.note,
          };
        }),
        weeklyRecoveryTips: 'Stay hydrated, sleep 7-9 hours, and eat enough protein.',
        deloadWeek: false,
      };

      const weekStart = new Date().toISOString().split('T')[0];
      const res = await api.post<{ success: boolean; data: WorkoutPlan }>('/fitness/custom-plan', {
        plan_data: planData,
        plan_name: planName,
        week_start: weekStart,
        person_id: personId || undefined,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (res.data && onPlanSaved) onPlanSaved(res.data);
    } catch { /* non-fatal */ }
    finally { setSaving(false); }
  };

  const totalExercises = Object.values(days).reduce((s, d) => s + d.exercises.length, 0);
  const activeDays = Object.values(days).filter(d => d.type !== 'Rest').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-rose-500 rounded-xl flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <input type="text" value={planName} onChange={e => setPlanName(e.target.value)}
            className="font-bold text-gray-900 dark:text-white bg-transparent border-none outline-none text-base w-full"
            placeholder="Plan name…"
          />
          <p className="text-xs text-gray-400">{activeDays} training days · {totalExercises} exercises</p>
        </div>
        <button onClick={handleSave} disabled={saving || totalExercises === 0}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold transition-all ${saved ? 'bg-emerald-500 text-white' : 'bg-gradient-to-r from-orange-500 to-rose-500 text-white hover:opacity-90'} disabled:opacity-50`}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Plan'}
        </button>
      </div>

      <div className="grid lg:grid-cols-[1fr_280px] gap-4">
        {/* LEFT: weekly grid */}
        <div className="space-y-2">
          {/* Day tabs */}
          <div className="flex gap-1 overflow-x-auto pb-1">
            {DAYS.map(d => (
              <button key={d} onClick={() => setActiveDay(d)}
                className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border text-xs font-bold transition-all ${activeDay === d ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-600' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-500 hover:border-orange-200'}`}>
                <span>{d.slice(0, 3)}</span>
                <span className="text-[10px] font-normal text-gray-400 mt-0.5">{days[d].exercises.length || (days[d].type === 'Rest' ? '😴' : '0')}ex</span>
              </button>
            ))}
          </div>

          {/* Active day editor */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-gray-900 dark:text-white">{activeDay}</h3>
              <select value={days[activeDay].type} onChange={e => setDayType(activeDay, e.target.value)}
                className="text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-1.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold focus:outline-none focus:ring-2 focus:ring-orange-400">
                {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            {days[activeDay].type === 'Rest' ? (
              <div className="text-center py-6 text-gray-300 dark:text-gray-600">
                <span className="text-3xl">😴</span>
                <p className="text-sm font-semibold text-gray-400 mt-2">Rest Day — Recovery is training too</p>
              </div>
            ) : (
              <>
                {days[activeDay].exercises.length === 0 ? (
                  <div className="text-center py-6 border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl">
                    <Plus className="w-6 h-6 mx-auto text-gray-200 dark:text-gray-700 mb-1" />
                    <p className="text-xs text-gray-400">Click exercises from the panel →</p>
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {days[activeDay].exercises.map(ex => (
                      <ExercisePill key={ex.id} ex={ex}
                        onRemove={() => removeExercise(activeDay, ex.id)}
                        onEdit={(f, v) => editExercise(activeDay, ex.id, f, v)}
                      />
                    ))}
                  </div>
                )}
                <textarea value={days[activeDay].note} onChange={e => setDayNote(activeDay, e.target.value)}
                  placeholder="Session note (optional)…" rows={2}
                  className="w-full text-xs border border-gray-100 dark:border-gray-700 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 placeholder-gray-300 resize-none" />
              </>
            )}
          </div>

          {/* Week overview mini grid */}
          <div className="grid grid-cols-7 gap-1">
            {DAYS.map(d => (
              <div key={d} onClick={() => setActiveDay(d)}
                className={`rounded-xl p-2 text-center cursor-pointer border transition-all ${activeDay === d ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-orange-200'}`}>
                <p className="text-[10px] font-bold text-gray-400">{d.slice(0, 2)}</p>
                <p className="text-xs font-black text-gray-900 dark:text-white">{days[d].type === 'Rest' ? '—' : days[d].exercises.length}</p>
                <p className="text-[9px] text-gray-400 truncate">{days[d].type.slice(0, 4)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: exercise picker panel */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 space-y-2 h-fit">
          <p className="text-xs font-bold text-gray-900 dark:text-white">Add to {activeDay}</p>
          <input type="text" value={exSearch} onChange={e => setExSearch(e.target.value)}
            placeholder="Search…"
            className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-orange-400 bg-gray-50 dark:bg-gray-900" />
          <div className="flex flex-wrap gap-1">
            {EX_CATEGORIES.map(c => (
              <button key={c} onClick={() => setExCategory(c)}
                className={`px-2 py-0.5 rounded-lg text-[10px] font-bold transition-all ${exCategory === c ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-orange-100'}`}>
                {c}
              </button>
            ))}
          </div>
          <div className="space-y-1.5 max-h-96 overflow-y-auto">
            {filteredEx.map(ex => {
              const isAdded = days[activeDay].exercises.some(e => e.id === ex.id);
              return (
                <button key={ex.id} onClick={() => addExercise(ex)} disabled={isAdded || days[activeDay].type === 'Rest'}
                  className={`w-full flex items-center gap-2 p-2 rounded-xl border text-left transition-all ${isAdded ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20 opacity-60 cursor-default' : 'border-gray-100 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-950/10'}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{ex.name}</p>
                    <p className="text-[10px] text-gray-400 truncate">{ex.muscles.slice(0, 2).join(' · ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[10px] font-bold text-orange-600">{ex.sets}×{ex.reps}</p>
                    {isAdded ? <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" /> : <Plus className="w-3 h-3 text-gray-300" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
