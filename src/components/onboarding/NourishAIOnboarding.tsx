/**
 * NourishAIOnboarding — First-time experience showcasing the intelligence platform.
 * Shown after initial onboarding, guides users through the new AI capabilities.
 * Slides: Welcome → Intelligence Agents → Lab Analysis → Brain Assessment → Fitness → Get Started
 */
import React, { useState, useEffect } from 'react';
import {
  Brain, Activity, Dumbbell, Apple, Shield, Sparkles, Zap, Users,
  ChevronRight, ChevronLeft, X, ArrowRight, CheckCircle2, Crown,
} from 'lucide-react';

interface NourishAIOnboardingProps {
  onComplete: () => void;
}

interface OnboardingSlide {
  icon: typeof Brain;
  iconGradient: string;
  title: string;
  subtitle: string;
  features: string[];
  color: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    icon: Sparkles,
    iconGradient: 'from-purple-500 to-indigo-600',
    title: 'Welcome to NourishAI',
    subtitle: '8 specialized AI agents working together to decode your health.',
    features: [
      'Multi-agent intelligence across every health domain',
      'Evidence-based recommendations with PubMed citations',
      'USDA-verified nutritional data for every meal',
      'Cross-domain correlation between labs, brain, fitness & nutrition',
    ],
    color: 'purple',
  },
  {
    icon: Activity,
    iconGradient: 'from-rose-500 to-red-600',
    title: 'Lab Intelligence',
    subtitle: 'Upload lab reports for AI-powered biomarker analysis.',
    features: [
      'Scan or upload any standard lab report',
      'AI evaluates each biomarker against optimal functional ranges',
      'PubMed-cited recommendations for out-of-range values',
      'Track trends over time with interactive charts',
    ],
    color: 'rose',
  },
  {
    icon: Brain,
    iconGradient: 'from-purple-500 to-violet-600',
    title: 'Brain Assessment',
    subtitle: 'Braverman neurotransmitter profiling for your whole family.',
    features: [
      'Comprehensive Braverman Nature & Deficiency test',
      'Independent assessments for each family member',
      'Research-backed recovery protocols with dosing',
      'Neuro-nutritional food recommendations',
    ],
    color: 'purple',
  },
  {
    icon: Dumbbell,
    iconGradient: 'from-orange-500 to-amber-600',
    title: 'Fitness Intelligence',
    subtitle: 'AI workout plans that adapt to your progress.',
    features: [
      'Smart workout generation based on your goals',
      'Plateau detection with automatic periodization',
      'Exercise form demonstrations from the AI coach',
      'Monthly progress reports with statistical analysis',
    ],
    color: 'orange',
  },
  {
    icon: Shield,
    iconGradient: 'from-indigo-500 to-blue-600',
    title: 'Health Reports',
    subtitle: 'Cross-domain intelligence tying everything together.',
    features: [
      'Comprehensive health intelligence across all data sources',
      'Doctor visit preparation packages',
      'Family health comparison reports',
      'Export professional PDFs and slide decks',
    ],
    color: 'indigo',
  },
];

export default function NourishAIOnboarding({ onComplete }: NourishAIOnboardingProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if onboarding was already completed
    const seen = localStorage.getItem('nourishai_onboarding_seen');
    if (seen) {
      onComplete();
      return;
    }
    // Fade in
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  const slide = SLIDES[currentSlide];
  const isLast = currentSlide === SLIDES.length - 1;
  const SlideIcon = slide.icon;

  const handleComplete = () => {
    localStorage.setItem('nourishai_onboarding_seen', 'true');
    setIsVisible(false);
    setTimeout(onComplete, 300);
  };

  const handleNext = () => {
    if (isLast) {
      handleComplete();
    } else {
      setCurrentSlide(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(prev => prev - 1);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleComplete} />

      {/* Modal */}
      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-500 scale-100">
        {/* Skip button */}
        <button
          onClick={handleComplete}
          className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header gradient */}
        <div className={`bg-gradient-to-br ${slide.iconGradient} p-8 text-white text-center`}>
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mb-4">
            <SlideIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-black mb-2">{slide.title}</h2>
          <p className="text-white/80 text-sm max-w-sm mx-auto">{slide.subtitle}</p>
        </div>

        {/* Features */}
        <div className="p-6 space-y-3">
          {slide.features.map((feature, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
            </div>
          ))}
        </div>

        {/* Progress dots & navigation */}
        <div className="px-6 pb-6 flex items-center justify-between">
          {/* Dots */}
          <div className="flex items-center gap-2">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`transition-all duration-300 rounded-full ${
                  i === currentSlide
                    ? 'w-8 h-2.5 bg-gradient-to-r ' + slide.iconGradient
                    : i < currentSlide
                    ? 'w-2.5 h-2.5 bg-emerald-400'
                    : 'w-2.5 h-2.5 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-2">
            {currentSlide > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className={`flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r ${slide.iconGradient} text-white text-sm font-bold rounded-xl shadow-lg hover:opacity-90 transition-all`}
            >
              {isLast ? (
                <>
                  Get Started
                  <Zap className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
