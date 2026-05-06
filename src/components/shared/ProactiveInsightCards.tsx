/**
 * ProactiveInsightCards — P0 Dashboard Component
 * Renders the proactive health intelligence as actionable cards.
 * Shows urgent alerts first, then suggestions, then tips.
 */
import React, { useState, useEffect, useMemo } from 'react';
import {
  AlertTriangle, Info, Lightbulb, TrendingUp,
  ChevronRight, X, Sparkles, Shield,
  FlaskConical, Apple, Timer, Activity,
  MessageCircle, ExternalLink, RefreshCw
} from 'lucide-react';
import { generateProactiveInsights, type ProactiveInsight, type InsightCategory } from '../../services/proactiveInsights';

const SEVERITY_CONFIG = {
  urgent: {
    bg: 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/20',
    border: 'border-red-200 dark:border-red-900/40',
    icon: AlertTriangle,
    iconColor: 'text-red-500',
    badgeBg: 'bg-red-100 dark:bg-red-900/40',
    badgeText: 'text-red-700 dark:text-red-400',
    pulse: true,
  },
  warning: {
    bg: 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20',
    border: 'border-amber-200 dark:border-amber-900/40',
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    badgeBg: 'bg-amber-100 dark:bg-amber-900/40',
    badgeText: 'text-amber-700 dark:text-amber-400',
    pulse: false,
  },
  suggestion: {
    bg: 'bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20',
    border: 'border-sky-200 dark:border-sky-900/40',
    icon: Lightbulb,
    iconColor: 'text-sky-500',
    badgeBg: 'bg-sky-100 dark:bg-sky-900/40',
    badgeText: 'text-sky-700 dark:text-sky-400',
    pulse: false,
  },
  info: {
    bg: 'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/30',
    border: 'border-gray-200 dark:border-gray-700',
    icon: Info,
    iconColor: 'text-gray-400',
    badgeBg: 'bg-gray-100 dark:bg-gray-800',
    badgeText: 'text-gray-600 dark:text-gray-400',
    pulse: false,
  },
};

const CATEGORY_ICONS: Record<InsightCategory, React.ComponentType<{ className?: string }>> = {
  lab_trend: FlaskConical,
  nutrition_gap: Apple,
  pantry_alert: Timer,
  goal_progress: TrendingUp,
  cross_reference: Activity,
  health_tip: Sparkles,
  data_quality: Shield,
};

interface ProactiveInsightCardsProps {
  onNavigate?: (tab: string) => void;
  onChatPrompt?: (prompt: string) => void;
  maxCards?: number;
}

export default function ProactiveInsightCards({ onNavigate, onChatPrompt, maxCards = 6 }: ProactiveInsightCardsProps) {
  const [insights, setInsights] = useState<ProactiveInsight[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const generated = generateProactiveInsights();
      setInsights(generated);
    } catch (err) {
      console.warn('[InsightCards] Error generating insights:', err);
    }
    setLoading(false);
  }, []);

  const visibleInsights = useMemo(() =>
    insights
      .filter(i => !dismissed.has(i.id))
      .slice(0, maxCards),
    [insights, dismissed, maxCards]
  );

  const urgentCount = visibleInsights.filter(i => i.severity === 'urgent').length;
  const warningCount = visibleInsights.filter(i => i.severity === 'warning').length;

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set([...prev, id]));
  };

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      try {
        const generated = generateProactiveInsights();
        setInsights(generated);
        setDismissed(new Set());
      } catch (err) {
        console.warn('[InsightCards] Refresh error:', err);
      }
      setLoading(false);
    }, 500);
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Health Intelligence</h2>
            <p className="text-[11px] text-gray-400">Analyzing your data...</p>
          </div>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (visibleInsights.length === 0) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-2xl p-5 border border-emerald-200/50 dark:border-emerald-800/30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">All Clear! ✅</h3>
            <p className="text-xs text-emerald-600 dark:text-emerald-300/70">No urgent health insights right now. Keep tracking for smarter recommendations.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Health Intelligence</h2>
            <p className="text-[11px] text-gray-400">
              {urgentCount > 0 && <span className="text-red-500 font-bold">{urgentCount} urgent</span>}
              {urgentCount > 0 && warningCount > 0 && ' · '}
              {warningCount > 0 && <span className="text-amber-500 font-semibold">{warningCount} warning{warningCount > 1 ? 's' : ''}</span>}
              {urgentCount === 0 && warningCount === 0 && `${visibleInsights.length} insight${visibleInsights.length > 1 ? 's' : ''}`}
            </p>
          </div>
        </div>
        <button onClick={handleRefresh} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" title="Refresh insights">
          <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
        </button>
      </div>

      {/* Insight Cards */}
      <div className="space-y-2">
        {visibleInsights.map(insight => {
          const config = SEVERITY_CONFIG[insight.severity];
          const CategoryIcon = CATEGORY_ICONS[insight.category] || Info;
          const SeverityIcon = config.icon;
          const isExpanded = expandedId === insight.id;

          return (
            <div
              key={insight.id}
              className={`relative rounded-xl border ${config.bg} ${config.border} transition-all duration-200 overflow-hidden`}
            >
              {/* Urgent pulse indicator */}
              {config.pulse && (
                <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-ping" />
              )}

              <div className="p-3.5">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${config.badgeBg}`}>
                    <CategoryIcon className={`w-4 h-4 ${config.iconColor}`} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{insight.title}</h3>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full ${config.badgeBg} ${config.badgeText}`}>
                        {insight.severity}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">{insight.description}</p>

                    {/* Expanded detail */}
                    {isExpanded && insight.detail && (
                      <div className="mt-2 p-2.5 bg-white/60 dark:bg-gray-900/40 rounded-lg">
                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed whitespace-pre-line">{insight.detail}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-2">
                      {insight.chatPrompt && onChatPrompt && (
                        <button
                          onClick={() => onChatPrompt(insight.chatPrompt!)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 transition-colors"
                        >
                          <MessageCircle className="w-3 h-3" /> Ask AI
                        </button>
                      )}
                      {insight.targetPage && onNavigate && (
                        <button
                          onClick={() => onNavigate(insight.targetPage!)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> View
                        </button>
                      )}
                      {insight.detail && (
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : insight.id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-gray-400 hover:text-gray-600 transition-colors ml-auto"
                        >
                          {isExpanded ? 'Less' : 'More'} <ChevronRight className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dismiss */}
                  <button
                    onClick={() => handleDismiss(insight.id)}
                    className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors flex-shrink-0"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Show more / total count */}
      {insights.filter(i => !dismissed.has(i.id)).length > maxCards && (
        <p className="text-center text-[11px] text-gray-400 font-medium">
          +{insights.filter(i => !dismissed.has(i.id)).length - maxCards} more insights available
        </p>
      )}
    </div>
  );
}
