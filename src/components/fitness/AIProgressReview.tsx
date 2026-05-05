/**
 * AI Progress Review — weekly auto-report comparing sessions vs plan.
 * Phase 9 feature.
 */
import React, { useState, useEffect } from 'react';
import { TrendingUp, Zap, Target, Flame, RefreshCw, Loader2, CheckCircle, AlertCircle, Minus, ChevronDown, ChevronUp } from 'lucide-react';
import { api } from '../../services/apiClient';

interface ProgressReview {
  overallProgress: 'excellent' | 'good' | 'steady' | 'plateau' | 'declining';
  completionRate: number;
  sessionsCompleted: number;
  sessionsPlanned: number;
  keyInsights: string[];
  strengths: string[];
  areasToImprove: string[];
  nextWeekAdjustments: string;
  motivationalMessage: string;
  weightTrend: 'losing' | 'gaining' | 'stable' | 'unknown';
  streakDays: number;
  generatedAt: string;
}

interface Props {
  personId?: string;
  personName?: string;
}

const PROGRESS_CONFIG = {
  excellent: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40', icon: CheckCircle, label: 'Excellent Progress 🔥' },
  good: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/40', icon: TrendingUp, label: 'Good Progress 💪' },
  steady: { color: 'text-violet-600', bg: 'bg-violet-50 dark:bg-violet-950/20', border: 'border-violet-200 dark:border-violet-900/40', icon: Minus, label: 'Steady Progress 🎯' },
  plateau: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40', icon: AlertCircle, label: 'Plateau Detected ⚡' },
  declining: { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/40', icon: AlertCircle, label: 'Needs Attention 🛟' },
};

export default function AIProgressReview({ personId, personName }: Props) {
  const [review, setReview] = useState<ProgressReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ insights: true });

  useEffect(() => { load(false); }, [personId]);

  const load = async (force = false) => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (personId) qs.set('personId', personId);
      if (force) qs.set('force', '1');
      const res = await api.get<{ success: boolean; data: ProgressReview }>(`/fitness/progress-review?${qs}`);
      setReview(res.data);
    } catch { setReview(null); }
    finally { setLoading(false); }
  };

  const toggle = (k: string) => setExpanded(e => ({ ...e, [k]: !e[k] }));

  const cfg = review ? PROGRESS_CONFIG[review.overallProgress] || PROGRESS_CONFIG.steady : null;
  const StatusIcon = cfg?.icon || TrendingUp;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">
              {personName ? `${personName.split(' ')[0]}'s AI Review` : 'AI Progress Review'}
            </h2>
            <p className="text-[11px] text-gray-400">
              {review ? `Generated ${new Date(review.generatedAt).toLocaleDateString()}` : 'Weekly AI analysis'}
            </p>
          </div>
        </div>
        <button onClick={() => load(true)} disabled={loading}
          className="p-2 text-gray-400 hover:text-violet-500 rounded-xl hover:bg-violet-50 dark:hover:bg-violet-950/20 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading && !review ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-violet-400 mb-3" />
          <p className="text-sm font-bold text-gray-700 dark:text-gray-300">AI is analyzing your progress…</p>
          <p className="text-xs text-gray-400 mt-1">This takes about 10 seconds</p>
        </div>
      ) : !review ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-10 h-10 mx-auto mb-2 text-gray-200 dark:text-gray-700" />
          <p className="text-sm font-bold text-gray-500">No review available yet</p>
          <p className="text-xs text-gray-400 mt-1">Complete some workouts, then hit refresh to generate your first AI review.</p>
          <button onClick={() => load(true)} className="mt-3 px-4 py-2 bg-violet-500 text-white text-sm font-bold rounded-xl hover:bg-violet-600">
            Generate Review
          </button>
        </div>
      ) : (
        <>
          {/* Status card */}
          <div className={`${cfg!.bg} ${cfg!.border} border rounded-2xl p-4`}>
            <div className="flex items-center gap-3">
              <StatusIcon className={`w-6 h-6 ${cfg!.color}`} />
              <div className="flex-1">
                <p className={`font-black text-base ${cfg!.color}`}>{cfg!.label}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{review.motivationalMessage}</p>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: 'Sessions', value: `${review.sessionsCompleted}/${review.sessionsPlanned}`, sub: 'completed', icon: Flame, color: 'text-orange-500' },
              { label: 'Completion', value: `${review.completionRate}%`, sub: 'rate', icon: Target, color: 'text-violet-500' },
              { label: 'Streak', value: `${review.streakDays}d`, sub: 'active', icon: Zap, color: 'text-amber-500' },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3 text-center">
                <Icon className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className="font-black text-lg text-gray-900 dark:text-white leading-none">{value}</p>
                <p className="text-[10px] text-gray-400">{label} {sub}</p>
              </div>
            ))}
          </div>

          {/* Key Insights */}
          {[
            { key: 'insights', label: '🧠 Key Insights', items: review.keyInsights, color: 'violet' },
            { key: 'strengths', label: '💪 Strengths', items: review.strengths, color: 'emerald' },
            { key: 'improve', label: '🎯 Focus Areas', items: review.areasToImprove, color: 'amber' },
          ].map(({ key, label, items, color }) => items && items.length > 0 && (
            <div key={key} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <button onClick={() => toggle(key)} className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750">
                <span className="font-bold text-sm text-gray-900 dark:text-white">{label}</span>
                {expanded[key] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </button>
              {expanded[key] && (
                <div className="px-4 pb-4 space-y-1.5 border-t border-gray-50 dark:border-gray-700 pt-3">
                  {items.map((item, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full bg-${color}-400 mt-1.5 flex-shrink-0`} />
                      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{item}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Next week adjustments */}
          {review.nextWeekAdjustments && (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 border border-violet-100 dark:border-violet-900/30 rounded-2xl p-4">
              <p className="font-bold text-sm text-violet-700 dark:text-violet-400 mb-1.5 flex items-center gap-1.5">
                <Zap className="w-4 h-4" /> Next Week's AI Plan Adjustment
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{review.nextWeekAdjustments}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
