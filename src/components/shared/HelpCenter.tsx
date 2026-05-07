/**
 * HelpCenter — Floating help button + tour launcher panel.
 * Shows contextual tour for the current tab plus full tour directory.
 * Also contains feature tooltips system.
 */
import React, { useState, useEffect } from 'react';
import {
  HelpCircle, X, Play, CheckCircle2, RotateCcw,
  ChevronRight, BookOpen, Sparkles, Info
} from 'lucide-react';
import {
  TOUR_REGISTRY, getTourForTab, isTourCompleted, resetTour, resetAllTours,
  startDashboardTour,
  type TourId,
} from '../../services/guidedTours';
import { useStore } from '../../store/useStore';

interface Props {
  activeTab: string;
}

export default function HelpCenter({ activeTab }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [completedTours, setCompletedTours] = useState<Set<string>>(new Set());
  const [pulseHint, setPulseHint] = useState(false);
  const { people } = useStore();

  // Refresh completion state
  const refreshState = () => {
    const tours = Object.keys(TOUR_REGISTRY) as TourId[];
    const completed = new Set<string>();
    tours.forEach(id => {
      if (isTourCompleted(id)) completed.add(id);
    });
    setCompletedTours(completed);
  };

  useEffect(() => {
    refreshState();
    // Pulse the help button for first-time users
    if (!isTourCompleted('dashboard')) {
      const timer = setTimeout(() => setPulseHint(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Global keyboard shortcut — press "?" to toggle Help Center
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when typing in inputs/textareas
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.target as HTMLElement)?.isContentEditable) return;

      if (e.key === '?') {
        e.preventDefault();
        setIsOpen(prev => !prev);
        setPulseHint(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Auto-trigger dashboard tour after onboarding (one-shot)
  useEffect(() => {
    if (
      people.length > 0 &&
      activeTab === 'home' &&
      !isTourCompleted('dashboard') &&
      !localStorage.getItem('nourishAI_autoTourTriggered')
    ) {
      const timer = setTimeout(() => {
        localStorage.setItem('nourishAI_autoTourTriggered', '1');
        startDashboardTour(() => refreshState());
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [people.length, activeTab]);

  const contextualTourId = getTourForTab(activeTab);
  const totalTours = Object.keys(TOUR_REGISTRY).length;
  const completedCount = completedTours.size;

  const handleStartTour = (tourId: TourId) => {
    setIsOpen(false);
    // Small delay for the panel to close before the tour starts
    setTimeout(() => {
      const tour = TOUR_REGISTRY[tourId];
      tour.startFn(() => {
        refreshState();
      });
    }, 300);
  };

  const handleResetTour = (tourId: TourId, e: React.MouseEvent) => {
    e.stopPropagation();
    resetTour(tourId);
    refreshState();
  };

  const handleResetAll = () => {
    resetAllTours();
    refreshState();
  };

  return (
    <>
      {/* Floating Help Button */}
      <button
        id="tour-help-button"
        onClick={() => { setIsOpen(!isOpen); setPulseHint(false); }}
        className={`fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 ${
          isOpen
            ? 'bg-gray-800 text-white rotate-45'
            : 'bg-gradient-to-br from-primary-500 to-emerald-500 text-white'
        } ${pulseHint ? 'animate-bounce' : ''}`}
        aria-label="Help & Tours"
      >
        {isOpen ? <X className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
      </button>

      {/* Help Panel */}
      {isOpen && (
        <div className="fixed bottom-36 right-4 lg:bottom-20 lg:right-6 z-50 w-80 max-h-[70vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="p-4 bg-gradient-to-r from-primary-500 to-emerald-500 text-white">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-5 h-5" />
              <h3 className="font-bold text-sm">NourishAI Help Center</h3>
            </div>
            <p className="text-[11px] text-white/70">
              Interactive guided tours for every feature
            </p>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-white rounded-full h-1.5 transition-all duration-500"
                  style={{ width: `${(completedCount / totalTours) * 100}%` }}
                />
              </div>
              <span className="text-[10px] text-white/80 font-medium">
                {completedCount}/{totalTours}
              </span>
            </div>
          </div>

          <div className="overflow-y-auto max-h-[50vh] scrollbar-thin">
            {/* Contextual Tour (for current page) */}
            {contextualTourId && (
              <div className="p-3 border-b border-gray-100 dark:border-gray-800">
                <p className="text-[9px] font-bold text-primary-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Suggested for this page
                </p>
                <button
                  onClick={() => handleStartTour(contextualTourId)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors"
                >
                  <span className="text-xl">{TOUR_REGISTRY[contextualTourId].emoji}</span>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white">{TOUR_REGISTRY[contextualTourId].label}</p>
                    <p className="text-[10px] text-gray-500 truncate">{TOUR_REGISTRY[contextualTourId].description}</p>
                  </div>
                  <Play className="w-4 h-4 text-primary-500 flex-shrink-0" />
                </button>
              </div>
            )}

            {/* All Tours */}
            <div className="p-3">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-2">
                All Feature Tours
              </p>
              <div className="space-y-1">
                {(Object.entries(TOUR_REGISTRY) as [TourId, typeof TOUR_REGISTRY[TourId]][]).map(([id, tour]) => {
                  const completed = completedTours.has(id);
                  return (
                    <button
                      key={id}
                      onClick={() => handleStartTour(id)}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                    >
                      <span className="text-base">{tour.emoji}</span>
                      <div className="flex-1 text-left min-w-0">
                        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate">
                          {tour.label}
                        </p>
                      </div>
                      {completed ? (
                        <div className="flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <button
                            onClick={(e) => handleResetTour(id, e)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Replay tour"
                          >
                            <RotateCcw className="w-3 h-3 text-gray-400 hover:text-gray-600" />
                          </button>
                        </div>
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={handleResetAll}
              className="text-[10px] font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              Reset all tours
            </button>
            <div className="flex items-center gap-1 text-[10px] text-gray-400">
              <Info className="w-3 h-3" />
              Press ? anytime
            </div>
          </div>
        </div>
      )}
    </>
  );
}
