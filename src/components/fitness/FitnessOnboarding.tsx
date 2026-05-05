import React, { useState } from 'react';
import { ChevronRight, ChevronLeft, Check, Dumbbell, Zap } from 'lucide-react';
import { saveFitnessProfile } from '../../services/fitnessService';
import type { FitnessProfile } from '../../services/fitnessService';

const EQUIPMENT_OPTIONS = [
  { group: 'Gym', items: ['Barbell + plates', 'Cable machines', 'Smith machine', 'Leg press machine', 'Cardio machines', 'Free weights area'] },
  { group: 'Home', items: ['Adjustable dumbbells', 'Resistance bands', 'Pull-up bar', 'Kettlebells', 'Bench', 'Jump rope'] },
  { group: 'Minimal', items: ['Bodyweight only'] },
];

const TRAINING_STYLES = [
  { id: 'strength', label: 'Strength Training', emoji: '🏋️' },
  { id: 'hypertrophy', label: 'Muscle Building', emoji: '💪' },
  { id: 'hiit', label: 'HIIT / Metabolic', emoji: '⚡' },
  { id: 'endurance', label: 'Endurance / Cardio', emoji: '🏃' },
  { id: 'yoga', label: 'Yoga / Flexibility', emoji: '🧘' },
  { id: 'calisthenics', label: 'Calisthenics', emoji: '🤸' },
  { id: 'powerlifting', label: 'Powerlifting', emoji: '🔥' },
  { id: 'sport', label: 'Sport-Specific', emoji: '🎯' },
  { id: 'low_impact', label: 'Low Impact', emoji: '🌿' },
];

const GOALS = [
  { id: 'weight_loss', label: 'Lose Weight', emoji: '⚖️' },
  { id: 'muscle_gain', label: 'Build Muscle', emoji: '💪' },
  { id: 'endurance', label: 'Build Endurance', emoji: '🏃' },
  { id: 'flexibility', label: 'Improve Flexibility', emoji: '🧘' },
  { id: 'general_health', label: 'General Health', emoji: '❤️' },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: "Just getting started or returning after a long break" },
  { id: 'intermediate', label: 'Intermediate', desc: 'Training consistently, know the basics (6mo–2yr)' },
  { id: 'advanced', label: 'Advanced', desc: "Serious training for 2+ years" },
];

interface Props {
  initialProfile?: FitnessProfile | null;
  onComplete: (profile: FitnessProfile) => void;
  onCancel?: () => void;
  personId?: string;      // Phase 5: family member scoping
  personName?: string;    // shown in the header so it's clear whose profile this is
}

export default function FitnessOnboarding({ initialProfile, onComplete, onCancel, personId, personName }: Props) {
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<FitnessProfile>({
    fitness_level: initialProfile?.fitness_level || 'beginner',
    primary_goal: initialProfile?.primary_goal || 'general_health',
    secondary_goals: initialProfile?.secondary_goals || [],
    equipment: initialProfile?.equipment || [],
    training_styles: initialProfile?.training_styles || [],
    days_per_week: initialProfile?.days_per_week || 3,
    session_duration_min: initialProfile?.session_duration_min || 45,
    preferred_time: initialProfile?.preferred_time || 'morning',
    injuries: initialProfile?.injuries || [],
    height_cm: initialProfile?.height_cm,
    weight_kg: initialProfile?.weight_kg,
    photo_retention: initialProfile?.photo_retention || '30_days',
  });

  const toggleArr = (arr: string[], val: string): string[] =>
    arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val];

  const totalSteps = 6;

  const canProceed = () => {
    if (step === 1) return !!form.primary_goal;
    if (step === 2) return (form.equipment?.length || 0) > 0;
    if (step === 3) return (form.training_styles?.length || 0) > 0;
    return true;
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await saveFitnessProfile(form, personId);
      if (res.data) onComplete(res.data);
      else setError('Failed to save profile');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {initialProfile
              ? `Edit ${personName ? `${personName}'s` : 'Your'} Fitness Profile`
              : `Set Up ${personName ? `${personName}'s` : 'Your'} Fitness Profile`}
          </h2>
          <p className="text-sm text-gray-500">Step {step + 1} of {totalSteps}</p>
        </div>
        {onCancel && (
          <button onClick={onCancel} className="ml-auto text-gray-400 hover:text-gray-600 text-sm">Cancel</button>
        )}
      </div>

      <div className="h-1.5 bg-gray-100 rounded-full mb-8 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-orange-500 to-rose-500 transition-all duration-500"
          style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
      </div>

      <div className="min-h-[300px]">
        {step === 0 && (
          <div className="space-y-5">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Physical stats</h3>
            <p className="text-sm text-gray-500">Used to calibrate intensity and track your progress over time.</p>
            <div className="grid grid-cols-2 gap-4">
              {[['Height (cm)', 'height_cm', '175'], ['Weight (kg)', 'weight_kg', '75']].map(([label, field, ph]) => (
                <div key={field}>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                  <input type="number" placeholder={ph}
                    value={(form as Record<string, unknown>)[field] as number || ''}
                    onChange={e => setForm(f => ({ ...f, [field]: e.target.value ? parseFloat(e.target.value) : undefined }))}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-400" />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Photo privacy (for body analysis)</label>
              <div className="flex gap-3">
                {[['30_days', 'Keep 30 days'], ['immediate', 'Delete immediately']].map(([id, label]) => (
                  <button key={id} onClick={() => setForm(f => ({ ...f, photo_retention: id as '30_days' | 'immediate' }))}
                    className={`flex-1 py-2.5 px-3 rounded-xl border text-sm font-medium transition-all ${form.photo_retention === id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Primary goal</h3>
            {GOALS.map(g => (
              <button key={g.id} onClick={() => setForm(f => ({ ...f, primary_goal: g.id as FitnessProfile['primary_goal'] }))}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${form.primary_goal === g.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                <span className="text-2xl">{g.emoji}</span>
                <span className={`font-bold text-sm ${form.primary_goal === g.id ? 'text-orange-700' : 'text-gray-900 dark:text-white'}`}>{g.label}</span>
                {form.primary_goal === g.id && <Check className="w-4 h-4 text-orange-600 ml-auto" />}
              </button>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Available equipment</h3>
            <p className="text-sm text-gray-500">Select everything you have access to.</p>
            {EQUIPMENT_OPTIONS.map(group => (
              <div key={group.group}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{group.group}</p>
                <div className="flex flex-wrap gap-2">
                  {group.items.map(item => (
                    <button key={item} onClick={() => setForm(f => ({ ...f, equipment: toggleArr(f.equipment || [], item) }))}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${form.equipment?.includes(item) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 hover:border-gray-300'}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Training styles you enjoy</h3>
            <p className="text-sm text-gray-500">Pick all that apply — the AI will blend them.</p>
            <div className="grid grid-cols-2 gap-2">
              {TRAINING_STYLES.map(s => (
                <button key={s.id} onClick={() => setForm(f => ({ ...f, training_styles: toggleArr(f.training_styles || [], s.id) }))}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${form.training_styles?.includes(s.id) ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                  <span>{s.emoji}</span>
                  <span className={`text-sm font-semibold ${form.training_styles?.includes(s.id) ? 'text-orange-700' : 'text-gray-900 dark:text-white'}`}>{s.label}</span>
                  {form.training_styles?.includes(s.id) && <Check className="w-3.5 h-3.5 text-orange-600 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Your schedule</h3>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Days per week: <span className="text-orange-600">{form.days_per_week}</span>
              </label>
              <input type="range" min={1} max={7} value={form.days_per_week}
                onChange={e => setForm(f => ({ ...f, days_per_week: parseInt(e.target.value) }))}
                className="w-full accent-orange-500" />
              <div className="flex justify-between text-xs text-gray-400 mt-1"><span>1</span><span>7</span></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Session duration (minutes)</label>
              <div className="flex gap-2">
                {[30, 45, 60, 75, 90].map(d => (
                  <button key={d} onClick={() => setForm(f => ({ ...f, session_duration_min: d }))}
                    className={`flex-1 py-2 rounded-xl border text-sm font-semibold transition-all ${form.session_duration_min === d ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred training time</label>
              <div className="flex gap-2">
                {[['morning', '🌅 Morning'], ['afternoon', '☀️ Afternoon'], ['evening', '🌙 Evening']].map(([id, label]) => (
                  <button key={id} onClick={() => setForm(f => ({ ...f, preferred_time: id as FitnessProfile['preferred_time'] }))}
                    className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${form.preferred_time === id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Experience level</h3>
            {EXPERIENCE_LEVELS.map(level => (
              <button key={level.id} onClick={() => setForm(f => ({ ...f, fitness_level: level.id as FitnessProfile['fitness_level'] }))}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${form.fitness_level === level.id ? 'border-orange-500 bg-orange-50' : 'border-gray-200 hover:border-orange-200'}`}>
                <div>
                  <p className={`font-bold text-sm ${form.fitness_level === level.id ? 'text-orange-700' : 'text-gray-900 dark:text-white'}`}>{level.label}</p>
                  <p className="text-xs text-gray-500">{level.desc}</p>
                </div>
                {form.fitness_level === level.id && <Check className="w-4 h-4 text-orange-600 ml-auto" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600 mt-3">{error}</p>}

      <div className="flex gap-3 mt-8">
        {step > 0 && (
          <button onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:border-gray-300 transition-all">
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <button onClick={step < totalSteps - 1 ? () => setStep(s => s + 1) : handleSave}
          disabled={!canProceed() || saving}
          className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-bold py-2.5 px-6 rounded-xl text-sm hover:from-orange-600 hover:to-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <><Zap className="w-4 h-4 animate-spin" /> Saving…</>
            : step < totalSteps - 1 ? <>Continue <ChevronRight className="w-4 h-4" /></>
            : <><Check className="w-4 h-4" /> Save Profile</>}
        </button>
      </div>
    </div>
  );
}
