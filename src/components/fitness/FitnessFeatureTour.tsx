/**
 * FitnessFeatureTour — One-time guided highlight tour for new fitness users.
 * 5 steps highlighting key tabs. Dismissed to localStorage.
 * Phase 9 polish feature.
 */
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, Dumbbell, Brain, Users, Trophy, PlayCircle, Zap } from 'lucide-react';

const TOUR_KEY = 'fitness_tour_v1_seen';

interface Step {
  emoji: string;
  title: string;
  body: string;
  cta: string;
  tab: string;
  icon: React.ElementType;
  color: string;
}

const STEPS: Step[] = [
  {
    emoji: '👋',
    title: 'Welcome to your Fitness Hub!',
    body: 'This is your personal AI-powered fitness command center. Let\'s take a quick tour of what\'s available.',
    cta: 'Show me around',
    tab: '',
    icon: Zap,
    color: 'from-orange-500 to-rose-500',
  },
  {
    emoji: '🏋️',
    title: 'Build Your Plan',
    body: 'Go to "Build" to design your own weekly workout schedule — pick exercises, set sets & reps, and save it as your active plan.',
    cta: 'Got it',
    tab: 'builder',
    icon: Dumbbell,
    color: 'from-orange-500 to-amber-500',
  },
  {
    emoji: '▶️',
    title: 'Start Workouts In Real-Time',
    body: 'In "My Plan", tap the orange Start button on any day card to open the live session tracker — it times your rest, logs your sets, and syncs your XP.',
    cta: 'Nice!',
    tab: 'plan',
    icon: PlayCircle,
    color: 'from-rose-500 to-pink-500',
  },
  {
    emoji: '🤖',
    title: 'Your AI Coach',
    body: 'The AI Coach tab gives you real-time answers on technique, programming, nutrition, and recovery — trained on your actual profile and goals.',
    cta: 'Awesome',
    tab: 'coach',
    icon: Brain,
    color: 'from-violet-500 to-purple-500',
  },
  {
    emoji: '🏆',
    title: 'Family Challenges & Leaderboard',
    body: 'Create challenges like "1000 reps this week" that the whole family can track. Check the Rank tab to see who\'s top of the leaderboard!',
    cta: 'Let\'s go!',
    tab: 'challenges',
    icon: Trophy,
    color: 'from-amber-500 to-orange-500',
  },
];

interface Props {
  onNavigate: (tab: string) => void;
}

export default function FitnessFeatureTour({ onNavigate }: Props) {
  const [step, setStep] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TOUR_KEY);
    if (!seen) {
      // Small delay so dashboard has rendered first
      const t = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(TOUR_KEY, '1');
    setVisible(false);
  };

  const next = () => {
    if (STEPS[step].tab) onNavigate(STEPS[step].tab);
    if (step < STEPS.length - 1) {
      setStep(s => s + 1);
    } else {
      dismiss();
    }
  };

  if (!visible) return null;

  const s = STEPS[step];
  const StepIcon = s.icon;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Gradient header */}
        <div className={`bg-gradient-to-br ${s.color} p-6 relative`}>
          <button onClick={dismiss}
            className="absolute top-4 right-4 w-7 h-7 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
          <div className="text-4xl mb-2">{s.emoji}</div>
          <h2 className="text-white font-black text-xl leading-tight">{s.title}</h2>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{s.body}</p>

          {/* Step dots */}
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-6 bg-orange-500' : 'w-1.5 bg-gray-200 dark:bg-gray-700'}`} />
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button onClick={dismiss}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
              Skip tour
            </button>
            <button onClick={next}
              className={`flex-1 flex items-center justify-center gap-2 bg-gradient-to-r ${s.color} text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity`}>
              {s.cta}
              {step < STEPS.length - 1 ? <ChevronRight className="w-4 h-4" /> : <span>🚀</span>}
            </button>
          </div>

          <p className="text-center text-xs text-gray-300 dark:text-gray-600">
            Step {step + 1} of {STEPS.length}
          </p>
        </div>
      </div>
    </div>
  );
}
