/**
 * SmartOnboarding — First-use wizard that collects profile data
 * and unlocks personalized features.
 * Steps: Welcome → Blood Type → Health Goals → Allergies → Done
 */
import React, { useState } from 'react';
import {
  ChevronRight, ChevronLeft, Check, Sparkles,
  Heart, Shield, Droplets, Apple, Brain,
  Dumbbell, Leaf, AlertTriangle, X, ChefHat
} from 'lucide-react';
import { useStore } from '../../store/useStore';

const BLOOD_TYPES = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

const HEALTH_GOALS = [
  { id: 'weight_loss', label: 'Weight Loss', icon: '🏃', desc: 'Lose body fat safely' },
  { id: 'muscle_gain', label: 'Muscle Gain', icon: '💪', desc: 'Build lean muscle' },
  { id: 'energy', label: 'More Energy', icon: '⚡', desc: 'Stop afternoon crashes' },
  { id: 'gut_health', label: 'Gut Health', icon: '🦠', desc: 'Fix digestion issues' },
  { id: 'brain_health', label: 'Brain Health', icon: '🧠', desc: 'Focus & memory' },
  { id: 'hormone_balance', label: 'Hormone Balance', icon: '⚖️', desc: 'Balance hormones naturally' },
  { id: 'anti_inflammatory', label: 'Reduce Inflammation', icon: '🔥', desc: 'Fight chronic inflammation' },
  { id: 'blood_sugar', label: 'Blood Sugar Balance', icon: '📊', desc: 'Stabilize glucose' },
  { id: 'heart_health', label: 'Heart Health', icon: '❤️', desc: 'Cardiovascular wellness' },
  { id: 'immune_support', label: 'Immune Support', icon: '🛡️', desc: 'Strengthen immunity' },
  { id: 'sleep', label: 'Better Sleep', icon: '😴', desc: 'Fall asleep & stay asleep' },
  { id: 'general', label: 'General Health', icon: '✨', desc: 'Overall wellness' },
];

const COMMON_ALLERGIES = [
  'Dairy', 'Gluten', 'Eggs', 'Nuts', 'Shellfish',
  'Soy', 'Fish', 'Wheat', 'Corn', 'Sesame',
];

interface Props {
  onComplete: () => void;
  onSkip?: () => void;
}

export default function SmartOnboarding({ onComplete, onSkip }: Props) {
  const { people, updatePerson, addPerson } = useStore();
  const [step, setStep] = useState(0);
  const [name, setName] = useState(people[0]?.name || '');
  const [bloodType, setBloodType] = useState(people[0]?.bloodType || '');
  const [goals, setGoals] = useState<string[]>(people[0]?.goals || []);
  const [allergies, setAllergies] = useState<string[]>(people[0]?.allergies || []);
  const [customAllergy, setCustomAllergy] = useState('');

  const toggleGoal = (id: string) => {
    setGoals(prev => prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]);
  };

  const toggleAllergy = (a: string) => {
    setAllergies(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]);
  };

  const addCustomAllergy = () => {
    if (customAllergy.trim() && !allergies.includes(customAllergy.trim())) {
      setAllergies([...allergies, customAllergy.trim()]);
      setCustomAllergy('');
    }
  };

  const handleComplete = () => {
    const profileData = {
      name: name.trim() || 'Me',
      bloodType,
      goals,
      allergies,
    };

    if (people.length > 0) {
      updatePerson(people[0].id, profileData);
    } else {
      addPerson(profileData);
    }

    onComplete();
  };

  const canProceed = () => {
    switch (step) {
      case 0: return name.trim().length > 0;
      case 1: return true; // blood type is optional
      case 2: return true; // goals are optional
      case 3: return true; // allergies are optional
      default: return true;
    }
  };

  const steps = [
    // ── Step 0: Welcome / Name ──────────────────────────────────
    {
      title: 'Welcome to NourishAI',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">Let's personalize your experience</h2>
            <p className="text-gray-500 text-sm mt-2">
              NourishAI uses your health profile to deliver personalized meal plans, recipes, and insights tailored to your body.
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700 dark:text-gray-300 block mb-2">What's your name?</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Your first name"
              autoFocus
              className="w-full px-4 py-3 text-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Apple, label: 'Blood Type Diet', desc: 'Eat for your body' },
              { icon: Brain, label: 'AI Intelligence', desc: 'Smart health insights' },
              { icon: Shield, label: 'Lab Analysis', desc: 'Track biomarkers' },
            ].map(feat => (
              <div key={feat.label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                <feat.icon className="w-5 h-5 text-primary-500 mx-auto mb-1" />
                <p className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{feat.label}</p>
                <p className="text-[9px] text-gray-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      ),
    },

    // ── Step 1: Blood Type ──────────────────────────────────────
    {
      title: 'Your Blood Type',
      content: (
        <div className="space-y-5">
          <div className="text-center">
            <Droplets className="w-10 h-10 text-red-500 mx-auto mb-2" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">What's your blood type?</h2>
            <p className="text-sm text-gray-500 mt-1">
              This unlocks blood-type-specific food guides, recipes, and supplement protocols.
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BLOOD_TYPES.map(bt => (
              <button
                key={bt}
                onClick={() => setBloodType(bt === bloodType ? '' : bt)}
                className={`py-3 rounded-xl text-sm font-bold transition-all ${
                  bloodType === bt
                    ? 'bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-md shadow-red-500/25 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-red-300'
                }`}
              >
                {bt}
              </button>
            ))}
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200/50 dark:border-amber-800/30">
            <p className="text-xs text-amber-600 dark:text-amber-400">
              <strong>Don't know your blood type?</strong> That's okay — you can skip this and set it later in your profile. Most features will still work!
            </p>
          </div>
        </div>
      ),
    },

    // ── Step 2: Health Goals ────────────────────────────────────
    {
      title: 'Health Goals',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <Heart className="w-10 h-10 text-rose-500 mx-auto mb-2" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">What are your goals?</h2>
            <p className="text-sm text-gray-500 mt-1">Select all that apply. This shapes your meal plans and recommendations.</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {HEALTH_GOALS.map(goal => (
              <button
                key={goal.id}
                onClick={() => toggleGoal(goal.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all ${
                  goals.includes(goal.id)
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-2 border-primary-400 shadow-sm'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
                }`}
              >
                <span className="text-lg">{goal.icon}</span>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate">{goal.label}</p>
                  <p className="text-[10px] text-gray-400 truncate">{goal.desc}</p>
                </div>
                {goals.includes(goal.id) && (
                  <Check className="w-4 h-4 text-primary-500 ml-auto flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </div>
      ),
    },

    // ── Step 3: Allergies ──────────────────────────────────────
    {
      title: 'Allergies & Restrictions',
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-2" />
            <h2 className="text-xl font-black text-gray-900 dark:text-white">Any food allergies?</h2>
            <p className="text-sm text-gray-500 mt-1">We'll exclude these from all recipes and meal plans.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_ALLERGIES.map(a => (
              <button
                key={a}
                onClick={() => toggleAllergy(a)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  allergies.includes(a)
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-2 border-red-300'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {allergies.includes(a) && '✕ '}{a}
              </button>
            ))}
          </div>

          {/* Custom allergy */}
          <div className="flex gap-2">
            <input
              type="text"
              value={customAllergy}
              onChange={e => setCustomAllergy(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomAllergy()}
              placeholder="Add custom allergy..."
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl outline-none focus:ring-2 focus:ring-primary-400"
            />
            <button
              onClick={addCustomAllergy}
              disabled={!customAllergy.trim()}
              className="px-3 py-2 bg-primary-500 text-white rounded-xl text-sm font-semibold disabled:opacity-40"
            >
              Add
            </button>
          </div>

          {/* Custom allergies list */}
          {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {allergies.filter(a => !COMMON_ALLERGIES.includes(a)).map(a => (
                <span key={a} className="flex items-center gap-1 px-2.5 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-medium">
                  {a}
                  <button onClick={() => toggleAllergy(a)}>
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          {allergies.length === 0 && (
            <p className="text-xs text-gray-400 text-center">No allergies? Great! Just click continue.</p>
          )}
        </div>
      ),
    },

    // ── Step 4: Complete ────────────────────────────────────────
    {
      title: 'All Set!',
      content: (
        <div className="space-y-6 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <div>
            <h2 className="text-2xl font-black text-gray-900 dark:text-white">
              You're all set, {name.split(' ')[0]}! 🎉
            </h2>
            <p className="text-sm text-gray-500 mt-2">
              NourishAI is now personalized for you. Here's what's unlocked:
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {bloodType ? `Blood Type ${bloodType} food guide & recipes` : '101+ curated recipes'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {goals.length > 0 ? `${goals.length} health goal${goals.length > 1 ? 's' : ''} tracked` : 'Personalized health insights'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">AI-powered meal planning & supplement timing</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Proactive health intelligence dashboard</span>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const totalSteps = steps.length;
  const isLastStep = step === totalSteps - 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Progress bar */}
        <div className="flex items-center gap-1.5 mb-6">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                i <= step ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
          <div className="p-6">
            {steps[step].content}
          </div>

          {/* Footer with navigation */}
          <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            {step > 0 ? (
              <button
                onClick={() => setStep(s => s - 1)}
                className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <button
                onClick={onSkip}
                className="text-sm font-medium text-gray-400 hover:text-gray-500"
              >
                Skip for now
              </button>
            )}

            <button
              onClick={() => {
                if (isLastStep) {
                  handleComplete();
                } else {
                  setStep(s => s + 1);
                }
              }}
              disabled={!canProceed()}
              className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-40 ${
                isLastStep
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40'
                  : 'bg-primary-500 text-white hover:bg-primary-600 shadow-md'
              }`}
            >
              {isLastStep ? (
                <><Sparkles className="w-4 h-4" /> Let's Go!</>
              ) : (
                <>Continue <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
