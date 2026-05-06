/**
 * UsageLimitBanner — Inline warning when users approach or hit usage limits.
 * Shows remaining count, progress bar, and upgrade CTA.
 */
import React from 'react';
import { AlertTriangle, Crown, ArrowRight, Zap } from 'lucide-react';
import { useUsageTracker, type UsageType } from '../../contexts/UsageTrackerContext';
import { useSubscription } from '../../contexts/SubscriptionContext';

interface UsageLimitBannerProps {
  type: UsageType;
  className?: string;
}

const TYPE_LABELS: Record<UsageType, string> = {
  chat: 'AI chat messages',
  label_scan: 'label scans',
  meal_plan: 'meal plans',
  pdf_report: 'PDF reports',
};

export default function UsageLimitBanner({ type, className = '' }: UsageLimitBannerProps) {
  const { canUse, getUsage } = useUsageTracker();
  const { tier } = useSubscription();
  const { used, limit, remaining, resetLabel } = getUsage(type);

  // Don't show for unlimited tiers
  if (limit === Infinity) return null;

  // Don't show if plenty remaining (more than 30%)
  const usagePercent = limit > 0 ? (used / limit) * 100 : 0;
  if (usagePercent < 70) return null;

  const isExhausted = !canUse(type);
  const label = TYPE_LABELS[type];

  if (isExhausted) {
    return (
      <div className={`bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950/30 dark:to-orange-950/30 border border-red-200 dark:border-red-800 rounded-xl p-4 ${className}`}>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg flex-shrink-0">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-red-800 dark:text-red-300 text-sm">
              {label} limit reached
            </h4>
            <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">
              You've used all {limit} {label} {resetLabel}. Resets at midnight.
            </p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-xs font-bold rounded-lg hover:opacity-90 transition-opacity flex-shrink-0">
            <Crown className="w-3.5 h-3.5" />
            Upgrade
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Warning state — approaching limit
  return (
    <div className={`bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 ${className}`}>
      <div className="flex items-center gap-3">
        <Zap className="w-4 h-4 text-amber-600 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">
              {remaining} {label} remaining {resetLabel}
            </span>
            <span className="text-[10px] text-amber-600 font-mono">{used}/{limit}</span>
          </div>
          <div className="h-1.5 bg-amber-200 dark:bg-amber-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
