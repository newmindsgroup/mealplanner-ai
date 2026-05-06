/**
 * NutritionFitnessBridge — Cross-references meal plan macros with workout goals.
 * Shows protein targets, carb cycling, hydration, and pre/post workout nutrition.
 * Phase 8 feature.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { Apple, Droplets, Zap, Flame, Target, TrendingUp, Info, ChevronDown, ChevronUp, Pill } from 'lucide-react';
import type { FitnessProfile } from '../../services/fitnessService';
import { getExerciseNutritionProtocol, getExercisesForBloodType } from '../../data/exerciseNutritionDatabase';
import { getDailySupplementSchedule, getSupplementBloodTypeNote } from '../../data/supplementTimingDatabase';
import { useStore } from '../../store/useStore';

interface MacroData {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

interface Props {
  profile: FitnessProfile | null;
  todayIsWorkoutDay: boolean;
  personName?: string;
}

// ── Compute targets from profile ────────────────────────────────────────────────
function computeTargets(profile: FitnessProfile | null, isWorkoutDay: boolean) {
  const weight = profile?.weight_kg || 75;
  const goal = profile?.primary_goal || 'general_health';
  const level = profile?.fitness_level || 'beginner';

  // Protein: 1.6–2.4g/kg based on goal
  const proteinMultiplier =
    goal === 'muscle_gain' ? 2.2 :
    goal === 'weight_loss' ? 1.8 :
    goal === 'endurance' ? 1.6 :
    1.8;

  const protein = Math.round(weight * proteinMultiplier);

  // TDEE estimate (Mifflin-St Jeor approximation using weight only)
  const activityMultiplier =
    level === 'beginner' ? 1.35 :
    level === 'intermediate' ? 1.5 :
    1.6;
  const baseTDEE = Math.round(weight * 22 * activityMultiplier);
  const tdee = isWorkoutDay ? baseTDEE + 150 : baseTDEE - 100; // carb cycle

  // Macro split
  const proteinCals = protein * 4;
  const fat = Math.round(weight * 0.9);
  const fatCals = fat * 9;
  const carbs = Math.round((tdee - proteinCals - fatCals) / 4);

  // Hydration: body weight × 35ml + 500ml for workout days
  const hydration_ml = Math.round(weight * 35 + (isWorkoutDay ? 500 : 0));

  // Pre/post workout
  const preWorkout = goal === 'weight_loss'
    ? 'Small serving of oats + banana (30–45 min before). Low fat, easy to digest.'
    : 'Rice + chicken or oatmeal + eggs (60–90 min before). Carbs + protein for energy.';

  const postWorkout = goal === 'muscle_gain'
    ? `Protein shake (30g) + white rice or banana within 30 min. Hit ${protein}g total protein today.`
    : goal === 'weight_loss'
    ? 'Lean protein (chicken, fish, eggs) + vegetables. Minimize carbs unless early refeed day.'
    : `${Math.round(protein * 0.3)}g protein + complex carbs within 2 hrs post-workout.`;

  const goalLabel: Record<string, string> = {
    muscle_gain: 'Muscle Gain', weight_loss: 'Weight Loss', endurance: 'Endurance',
    flexibility: 'Flexibility', general_health: 'General Health',
  };

  return { protein, carbs, fat, tdee, hydration_ml, preWorkout, postWorkout, goalLabel: goalLabel[goal] || goal };
}

// ── Macro ring ──────────────────────────────────────────────────────────────────
function MacroRing({ label, grams, target, color, unit = 'g' }: {
  label: string; grams: number; target: number; color: string; unit?: string;
}) {
  const pct = target > 0 ? Math.min(100, Math.round((grams / target) * 100)) : 0;
  const r = 22;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const over = grams > target;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <svg width="56" height="56" className="rotate-[-90deg]">
          <circle cx="28" cy="28" r={r} fill="none" stroke="currentColor" strokeWidth={5} className="text-gray-100 dark:text-gray-700" />
          <circle cx="28" cy="28" r={r} fill="none" stroke={over ? '#f43f5e' : color} strokeWidth={5} strokeLinecap="round"
            strokeDasharray={`${Math.min(dash, circ)} ${circ}`} className="transition-all duration-700" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-black text-gray-700 dark:text-gray-300">{pct}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-xs font-black text-gray-900 dark:text-white">{grams}{unit}</p>
        <p className="text-[10px] text-gray-400">{label}</p>
        <p className="text-[10px] text-gray-300">/{target}{unit}</p>
      </div>
    </div>
  );
}

export default function NutritionFitnessBridge({ profile, todayIsWorkoutDay, personName }: Props) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const { people } = useStore();
  const bloodType = people[0]?.bloodType || '';
  const t = computeTargets(profile, todayIsWorkoutDay);

  // Get blood-type-aware exercise nutrition protocol
  const exerciseProtocol = useMemo(() => {
    const goal = profile?.primary_goal || 'general_health';
    const typeMap: Record<string, string> = {
      muscle_gain: 'strength', weight_loss: 'hiit', endurance: 'endurance',
      flexibility: 'yoga', general_health: 'strength',
    };
    return getExerciseNutritionProtocol(typeMap[goal] || 'strength');
  }, [profile]);

  // Get top supplements for workout days
  const workoutSupplements = useMemo(() => {
    const schedule = getDailySupplementSchedule();
    const relevantSupps = schedule.morning.filter(s =>
      s.exerciseTiming === 'pre-workout' || s.exerciseTiming === 'post-workout' || s.exerciseTiming === 'any'
    );
    return relevantSupps.slice(0, 4);
  }, []);

  const toggle = (key: string) => setExpanded(e => ({ ...e, [key]: !e[key] }));

  if (!profile) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 text-center">
        <Apple className="w-8 h-8 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
        <p className="text-sm font-semibold text-gray-500">Set up your fitness profile to see nutrition targets</p>
      </div>
    );
  }

  const sections = [
    {
      id: 'macros',
      icon: Target,
      color: 'from-emerald-400 to-teal-500',
      title: 'Daily Macro Targets',
      subtitle: `${t.goalLabel} · ${todayIsWorkoutDay ? '🏋️ Training day' : '😴 Rest day'}`,
      content: (
        <div className="space-y-3">
          <div className="flex justify-around pt-1">
            <MacroRing label="Protein" grams={0} target={t.protein} color="#10b981" />
            <MacroRing label="Carbs" grams={0} target={t.carbs} color="#f59e0b" />
            <MacroRing label="Fat" grams={0} target={t.fat} color="#6366f1" />
            <MacroRing label="Calories" grams={0} target={t.tdee} color="#f97316" unit="" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: 'Protein target', value: `${t.protein}g`, color: 'text-emerald-600', desc: `${(t.protein / (profile.weight_kg || 75)).toFixed(1)}g per kg` },
              { label: 'Carb target', value: `${t.carbs}g`, color: 'text-amber-600', desc: todayIsWorkoutDay ? 'Higher on training days' : 'Lower on rest days' },
              { label: 'Fat target', value: `${t.fat}g`, color: 'text-violet-600', desc: 'Essential fats' },
              { label: 'Daily calories', value: `${t.tdee} kcal`, color: 'text-orange-600', desc: 'Estimated TDEE' },
            ].map(({ label, value, color, desc }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
                <p className={`font-black text-base ${color}`}>{value}</p>
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
                <p className="text-[10px] text-gray-400">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },
    {
      id: 'hydration',
      icon: Droplets,
      color: 'from-blue-400 to-cyan-500',
      title: 'Hydration Target',
      subtitle: `${t.hydration_ml >= 1000 ? `${(t.hydration_ml / 1000).toFixed(1)}L` : `${t.hydration_ml}ml`} today${todayIsWorkoutDay ? ' (+500ml for training)' : ''}`,
      content: (
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Droplets className="w-8 h-8 text-blue-400" />
            <div>
              <p className="font-black text-2xl text-blue-500">{(t.hydration_ml / 1000).toFixed(1)}L</p>
              <p className="text-xs text-gray-400">≈ {Math.round(t.hydration_ml / 250)} glasses of water</p>
            </div>
          </div>
          <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
            <p>☀️ On waking: 500ml water before anything else</p>
            {todayIsWorkoutDay && <p>🏋️ Pre-workout: 500ml in the 2 hrs before training</p>}
            {todayIsWorkoutDay && <p>💧 During workout: 200–300ml every 15–20 min</p>}
            <p>🌙 Throughout day: sip consistently, urine should be pale yellow</p>
          </div>
        </div>
      ),
    },
    {
      id: 'timing',
      icon: Zap,
      color: 'from-orange-400 to-amber-500',
      title: 'Workout Nutrition Timing',
      subtitle: todayIsWorkoutDay ? 'Pre + post workout fuel' : 'Rest day nutrition focus',
      content: (
        <div className="space-y-3">
          {todayIsWorkoutDay ? (
            <>
              <div className="bg-orange-50 dark:bg-orange-950/20 rounded-xl p-3 border border-orange-100 dark:border-orange-900/30">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-1">🍌 Pre-Workout</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.preWorkout}</p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/20 rounded-xl p-3 border border-emerald-100 dark:border-emerald-900/30">
                <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-1">🥩 Post-Workout</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{t.postWorkout}</p>
              </div>
            </>
          ) : (
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl p-3 border border-violet-100 dark:border-violet-900/30">
              <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">😴 Rest Day Focus</p>
              <p className="text-xs text-gray-600 dark:text-gray-400">Keep calories slightly lower. Maintain protein intake ({t.protein}g). Focus on whole foods, vegetables, and healthy fats for recovery and hormonal balance.</p>
            </div>
          )}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3">
              <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">💊 Exercise Supplement Stack</p>
              <div className="space-y-1">
                {workoutSupplements.map(s => {
                  const btNote = bloodType ? getSupplementBloodTypeNote(s.name, bloodType) : null;
                  return (
                    <div key={s.name} className="text-xs text-gray-500">
                      <span className="font-semibold">{s.name}</span> ({s.dosageRange})
                      {s.exerciseTiming && <span className="text-gray-400"> · {s.exerciseTiming}</span>}
                      {btNote && <span className="text-violet-500 dark:text-violet-400 block text-[10px] ml-2">🩸 {btNote}</span>}
                    </div>
                  );
                })}
              </div>
            </div>
            {exerciseProtocol && (
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-xl p-3 border border-blue-100 dark:border-blue-900/30">
                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">🏃 {exerciseProtocol.exerciseType} Protocol</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Hydration: {exerciseProtocol.hydration.during}</p>
                {exerciseProtocol.bloodTypeNotes && bloodType && (
                  <p className="text-[10px] text-violet-600 dark:text-violet-400 mt-1">
                    🩸 Type {bloodType.replace(/[+-]/, '')}: {exerciseProtocol.bloodTypeNotes[bloodType.replace(/[+-]/, '').toUpperCase()] || 'Follow general protocol'}
                  </p>
                )}
              </div>
            )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
          <Apple className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">
            {personName ? `${personName.split(' ')[0]}'s Nutrition Targets` : 'Nutrition Targets'}
          </h3>
          <p className="text-[11px] text-gray-400">Synced with your fitness goals</p>
        </div>
      </div>

      {sections.map(({ id, icon: Icon, color, title, subtitle, content }) => (
        <div key={id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <button onClick={() => toggle(id)} className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
            <div className={`w-8 h-8 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-gray-900 dark:text-white">{title}</p>
              <p className="text-[11px] text-gray-400 truncate">{subtitle}</p>
            </div>
            {expanded[id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
          </button>
          {expanded[id] && (
            <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-700 pt-3">
              {content}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
