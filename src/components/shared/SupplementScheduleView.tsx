/**
 * SupplementScheduleView — P1 Dashboard Component
 * Visual daily supplement routine organized by time-of-day.
 * Shows dosage, absorption notes, and blood-type tips.
 */
import React, { useState, useMemo } from 'react';
import {
  Clock, Sun, Sunset, Moon, Coffee,
  ChevronDown, ChevronRight, AlertTriangle,
  Info, Pill, Droplets, Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  getDailySupplementSchedule,
  getSupplementTiming,
  checkSupplementConflicts,
  SUPPLEMENT_COUNT,
  type SupplementTiming,
} from '../../data/supplementTimingDatabase';

const TIME_SLOTS = [
  { key: 'morning', label: 'Morning', icon: Sun, color: 'from-amber-400 to-orange-500', lightBg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-800/40' },
  { key: 'afternoon', label: 'Afternoon', icon: Coffee, color: 'from-sky-400 to-blue-500', lightBg: 'bg-sky-50 dark:bg-sky-950/20', border: 'border-sky-200 dark:border-sky-800/40' },
  { key: 'evening', label: 'Evening', icon: Sunset, color: 'from-violet-400 to-purple-500', lightBg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-800/40' },
  { key: 'bedtime', label: 'Bedtime', icon: Moon, color: 'from-indigo-400 to-slate-600', lightBg: 'bg-indigo-50 dark:bg-indigo-950/20', border: 'border-indigo-200 dark:border-indigo-800/40' },
  { key: 'any', label: 'Any Time', icon: Clock, color: 'from-gray-400 to-gray-500', lightBg: 'bg-gray-50 dark:bg-gray-800/50', border: 'border-gray-200 dark:border-gray-700' },
];

export default function SupplementScheduleView() {
  const { people } = useStore();
  const [expandedSupplement, setExpandedSupplement] = useState<string | null>(null);

  const bloodType = people[0]?.bloodType || '';
  const bt = bloodType.replace(/[+-]/, '').toUpperCase();

  const schedule = useMemo(() => getDailySupplementSchedule(), []);

  const conflicts = useMemo(() => {
    // Check conflicts among all supplements (all of them together)
    const allNames = Object.values(schedule).flat().map(s => s.name);
    return checkSupplementConflicts(allNames);
  }, [schedule]);

  return (
    <div id="tour-supplement-schedule" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Pill className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Supplement Schedule</h2>
            <p className="text-[11px] text-gray-400">
              {SUPPLEMENT_COUNT} supplements · Optimal timing guide
              {bt && ` · Type ${bt} notes`}
            </p>
          </div>
        </div>
      </div>

      {/* Conflicts warning */}
      {conflicts.length > 0 && (
        <div id="tour-supplement-interactions" className="bg-amber-50 dark:bg-amber-950/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800/40">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Timing Conflicts Detected</p>
              {conflicts.slice(0, 3).map((c, i) => (
                <p key={i} className="text-[11px] text-amber-600 dark:text-amber-300/80 mt-0.5">
                  {c.supplement1} ↔ {c.supplement2}: {c.conflict}
                </p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Schedule by time */}
      <div id="tour-supplement-timing" className="space-y-3">
        {TIME_SLOTS.map(slot => {
          const supplements = schedule[slot.key] || [];
          if (supplements.length === 0) return null;

          const SlotIcon = slot.icon;

          return (
            <div key={slot.key} className={`rounded-xl border ${slot.border} overflow-hidden`}>
              {/* Time slot header */}
              <div className={`flex items-center gap-2 px-3.5 py-2.5 ${slot.lightBg}`}>
                <div className={`w-6 h-6 bg-gradient-to-br ${slot.color} rounded-lg flex items-center justify-center`}>
                  <SlotIcon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-gray-700 dark:text-gray-300">{slot.label}</span>
                <span className="text-[10px] text-gray-400 font-medium ml-auto">{supplements.length} supplement{supplements.length > 1 ? 's' : ''}</span>
              </div>

              {/* Supplement list */}
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {supplements.map(supp => {
                  const isExpanded = expandedSupplement === supp.name;
                  const btNote = bt && supp.bloodTypeNotes?.[bt];

                  return (
                    <div key={supp.name} className="px-3.5 py-2.5">
                      <button
                        onClick={() => setExpandedSupplement(isExpanded ? null : supp.name)}
                        className="w-full flex items-center gap-2 text-left"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{supp.name}</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                              {supp.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-0.5">
                            <span className="text-[11px] text-gray-500">
                              {supp.mealTiming === 'with food' ? '🍽️ With food' : supp.mealTiming === 'empty stomach' ? '⏰ Empty stomach' : '🔄 Either'}
                            </span>
                            <span className="text-[11px] text-gray-400">{supp.dosageRange}</span>
                          </div>
                        </div>
                        <ChevronRight className={`w-4 h-4 text-gray-300 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                      </button>

                      {/* Expanded detail */}
                      {isExpanded && (
                        <div className="mt-2 space-y-2 pl-0">
                          {/* Absorption note */}
                          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-2.5">
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                              <span className="font-bold">💡 Absorption:</span> {supp.absorptionNotes}
                            </p>
                          </div>

                          {/* Take with */}
                          {supp.takeWith && supp.takeWith.length > 0 && (
                            <div className="bg-emerald-50/50 dark:bg-emerald-950/10 rounded-lg p-2.5">
                              <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mb-1">✅ Take with:</p>
                              {supp.takeWith.map((t, i) => (
                                <p key={i} className="text-[11px] text-emerald-700 dark:text-emerald-300/80">• {t}</p>
                              ))}
                            </div>
                          )}

                          {/* Avoid with */}
                          {supp.avoidWith && supp.avoidWith.length > 0 && (
                            <div className="bg-red-50/50 dark:bg-red-950/10 rounded-lg p-2.5">
                              <p className="text-[10px] font-bold text-red-600 dark:text-red-400 mb-1">⚠️ Don't take with:</p>
                              {supp.avoidWith.map((t, i) => (
                                <p key={i} className="text-[11px] text-red-700 dark:text-red-300/80">• {t}</p>
                              ))}
                            </div>
                          )}

                          {/* Blood type note */}
                          {btNote && (
                            <div className="bg-violet-50/50 dark:bg-violet-950/10 rounded-lg p-2.5">
                              <p className="text-[10px] font-bold text-violet-600 dark:text-violet-400 mb-1">
                                🩸 Type {bt} Note:
                              </p>
                              <p className="text-[11px] text-violet-700 dark:text-violet-300/80">{btNote}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 border border-gray-200 dark:border-gray-700">
        <p className="text-[10px] text-gray-400 leading-relaxed">
          ⚕️ This supplement timing guide is for educational purposes only. Always consult your healthcare provider before starting, stopping, or changing supplements, especially if you take medications.
        </p>
      </div>
    </div>
  );
}
