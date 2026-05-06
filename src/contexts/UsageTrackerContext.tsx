/**
 * UsageTracker — Tracks feature usage against subscription limits
 * 
 * Monitors: chat messages, label scans, meal plans, PDF reports
 * Persists usage data in localStorage with daily/weekly/monthly reset cycles.
 * 
 * Usage:
 *   const { canUse, recordUsage, getUsage } = useUsageTracker();
 *   if (!canUse('chat')) return <LimitReached />;
 *   recordUsage('chat');
 */
import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useSubscription } from './SubscriptionContext';

// ============================================================================
// TYPES
// ============================================================================

export type UsageType = 'chat' | 'label_scan' | 'meal_plan' | 'pdf_report';

interface UsageRecord {
  count: number;
  resetAt: number; // Unix timestamp
}

interface UsageData {
  chat: UsageRecord;          // resets daily
  label_scan: UsageRecord;    // resets daily
  meal_plan: UsageRecord;     // resets weekly
  pdf_report: UsageRecord;    // resets monthly
}

interface UsageTrackerContextType {
  /** Check if a usage type hasn't hit its limit */
  canUse: (type: UsageType) => boolean;
  /** Record one use */
  recordUsage: (type: UsageType) => void;
  /** Get current count and limit for a usage type */
  getUsage: (type: UsageType) => { used: number; limit: number; remaining: number; resetLabel: string };
  /** Get all usage data for dashboard display */
  allUsage: UsageData;
}

// ============================================================================
// RESET CYCLE HELPERS
// ============================================================================

function getNextDailyReset(): number {
  const now = new Date();
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  return tomorrow.getTime();
}

function getNextWeeklyReset(): number {
  const now = new Date();
  const daysUntilMonday = (8 - now.getDay()) % 7 || 7;
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilMonday);
  return nextMonday.getTime();
}

function getNextMonthlyReset(): number {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() + 1, 1).getTime();
}

const RESET_FN: Record<UsageType, () => number> = {
  chat: getNextDailyReset,
  label_scan: getNextDailyReset,
  meal_plan: getNextWeeklyReset,
  pdf_report: getNextMonthlyReset,
};

const RESET_LABEL: Record<UsageType, string> = {
  chat: 'today',
  label_scan: 'today',
  meal_plan: 'this week',
  pdf_report: 'this month',
};

const STORAGE_KEY = 'nourishai_usage';

// ============================================================================
// DEFAULT STATE
// ============================================================================

function createDefaultUsage(): UsageData {
  return {
    chat: { count: 0, resetAt: getNextDailyReset() },
    label_scan: { count: 0, resetAt: getNextDailyReset() },
    meal_plan: { count: 0, resetAt: getNextWeeklyReset() },
    pdf_report: { count: 0, resetAt: getNextMonthlyReset() },
  };
}

function loadUsage(): UsageData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return createDefaultUsage();
    const parsed: UsageData = JSON.parse(stored);
    
    // Reset any expired counters
    const now = Date.now();
    const types: UsageType[] = ['chat', 'label_scan', 'meal_plan', 'pdf_report'];
    for (const type of types) {
      if (!parsed[type] || now >= parsed[type].resetAt) {
        parsed[type] = { count: 0, resetAt: RESET_FN[type]() };
      }
    }
    return parsed;
  } catch {
    return createDefaultUsage();
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

const UsageTrackerContext = createContext<UsageTrackerContextType | null>(null);

export function UsageTrackerProvider({ children }: { children: ReactNode }) {
  const { limits } = useSubscription();
  const [usage, setUsage] = useState<UsageData>(loadUsage);

  // Persist to localStorage on change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  }, [usage]);

  // Check expiration every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setUsage(prev => {
        let changed = false;
        const updated = { ...prev };
        const types: UsageType[] = ['chat', 'label_scan', 'meal_plan', 'pdf_report'];
        for (const type of types) {
          if (now >= prev[type].resetAt) {
            updated[type] = { count: 0, resetAt: RESET_FN[type]() };
            changed = true;
          }
        }
        return changed ? updated : prev;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, []);

  const getLimitFor = useCallback((type: UsageType): number => {
    switch (type) {
      case 'chat': return limits.chatMessagesPerDay;
      case 'label_scan': return limits.labelScansPerDay;
      case 'meal_plan': return limits.mealsPerWeek;
      case 'pdf_report': return limits.pdfReportsPerMonth;
    }
  }, [limits]);

  const canUse = useCallback((type: UsageType): boolean => {
    const limit = getLimitFor(type);
    if (limit === Infinity) return true;
    return usage[type].count < limit;
  }, [usage, getLimitFor]);

  const recordUsage = useCallback((type: UsageType) => {
    setUsage(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        count: prev[type].count + 1,
      },
    }));
  }, []);

  const getUsage = useCallback((type: UsageType) => {
    const limit = getLimitFor(type);
    const used = usage[type].count;
    return {
      used,
      limit,
      remaining: limit === Infinity ? Infinity : Math.max(0, limit - used),
      resetLabel: RESET_LABEL[type],
    };
  }, [usage, getLimitFor]);

  return (
    <UsageTrackerContext.Provider value={{ canUse, recordUsage, getUsage, allUsage: usage }}>
      {children}
    </UsageTrackerContext.Provider>
  );
}

export function useUsageTracker() {
  const ctx = useContext(UsageTrackerContext);
  if (!ctx) throw new Error('useUsageTracker must be used within UsageTrackerProvider');
  return ctx;
}
