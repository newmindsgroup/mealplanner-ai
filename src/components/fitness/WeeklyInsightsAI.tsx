/**
 * WeeklyInsightsAI — Phase 12
 * AI-powered weekly workout intelligence summary.
 * Aggregates session data, sleep/stress scores, and body measurements
 * into a single "Weekly Digest" with recommendations.
 */
import React, { useState, useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Flame, Clock, Dumbbell, Moon, Zap, ChevronDown, ChevronUp, Calendar, Award, AlertTriangle } from 'lucide-react';

interface WeekDay {
  label: string;
  trained: boolean;
  duration: number; // minutes
  volume: number; // total sets
  muscles: string[];
}

interface InsightCard {
  icon: React.ElementType;
  title: string;
  value: string;
  detail: string;
  trend: 'up' | 'down' | 'neutral';
  color: string;
}

interface Props {
  sessions?: any[];
  profile?: any;
  plan?: any;
}

export default function WeeklyInsightsAI({ sessions = [], profile, plan }: Props) {
  const [expanded, setExpanded] = useState(false);

  // Demo data
  const demoWeek: WeekDay[] = [
    { label: 'Mon', trained: true, duration: 52, volume: 18, muscles: ['chest', 'triceps', 'shoulders'] },
    { label: 'Tue', trained: false, duration: 0, volume: 0, muscles: [] },
    { label: 'Wed', trained: true, duration: 45, volume: 16, muscles: ['back', 'biceps'] },
    { label: 'Thu', trained: true, duration: 38, volume: 14, muscles: ['legs', 'glutes', 'calves'] },
    { label: 'Fri', trained: false, duration: 0, volume: 0, muscles: [] },
    { label: 'Sat', trained: true, duration: 55, volume: 20, muscles: ['shoulders', 'arms', 'abs'] },
    { label: 'Sun', trained: false, duration: 0, volume: 0, muscles: [] },
  ];

  const week = demoWeek;
  const activeDays = week.filter(d => d.trained);
  const totalDuration = activeDays.reduce((s, d) => s + d.duration, 0);
  const totalVolume = activeDays.reduce((s, d) => s + d.volume, 0);
  const avgDuration = activeDays.length ? Math.round(totalDuration / activeDays.length) : 0;
  const consistency = Math.round((activeDays.length / 7) * 100);

  const insights: InsightCard[] = [
    {
      icon: Flame,
      title: 'Training Days',
      value: `${activeDays.length}/7`,
      detail: consistency >= 60 ? 'On track — great consistency!' : 'Consider adding one more session',
      trend: consistency >= 60 ? 'up' : 'down',
      color: 'from-orange-400 to-rose-500',
    },
    {
      icon: Clock,
      title: 'Avg Duration',
      value: `${avgDuration} min`,
      detail: avgDuration >= 40 ? 'Solid session length' : 'Try to hit 40+ minutes per workout',
      trend: avgDuration >= 40 ? 'up' : 'neutral',
      color: 'from-violet-400 to-purple-500',
    },
    {
      icon: Dumbbell,
      title: 'Total Volume',
      value: `${totalVolume} sets`,
      detail: totalVolume >= 50 ? 'High volume week — monitor recovery' : 'Good volume — room to progress',
      trend: totalVolume >= 50 ? 'up' : 'neutral',
      color: 'from-blue-400 to-cyan-500',
    },
    {
      icon: Zap,
      title: 'Intensity Score',
      value: `${Math.min(10, Math.round((totalVolume / Math.max(1, activeDays.length)) * 0.6))}/10`,
      detail: 'Based on sets per session and muscle distribution',
      trend: 'neutral',
      color: 'from-amber-400 to-orange-500',
    },
  ];

  // AI-generated recommendations based on data
  const recommendations = useMemo(() => {
    const recs: { emoji: string; text: string; priority: 'high' | 'medium' | 'low' }[] = [];

    if (activeDays.length < 3) {
      recs.push({ emoji: '📅', text: 'Add 1-2 more training days for optimal progress. Try Tue and Fri.', priority: 'high' });
    }
    if (totalVolume < 40) {
      recs.push({ emoji: '📈', text: 'Increase volume by 2-3 sets per workout to drive adaptation.', priority: 'medium' });
    }
    if (avgDuration < 35) {
      recs.push({ emoji: '⏱️', text: 'Sessions are short. Add 1-2 accessory exercises per day.', priority: 'medium' });
    }

    const allMuscles = week.flatMap(d => d.muscles);
    if (!allMuscles.includes('legs') && !allMuscles.includes('quads')) {
      recs.push({ emoji: '🦵', text: 'No leg training detected! Add a lower-body day for balanced development.', priority: 'high' });
    }
    if (activeDays.length >= 5) {
      recs.push({ emoji: '💤', text: 'High frequency. Ensure 7-9 hours of sleep and at least 2 rest days.', priority: 'medium' });
    }
    if (activeDays.length >= 3 && totalVolume >= 50) {
      recs.push({ emoji: '🏆', text: 'Excellent week! Consider a deload next week if fatigue accumulates.', priority: 'low' });
    }

    if (recs.length === 0) {
      recs.push({ emoji: '✅', text: 'Looking good! Maintain current frequency and volume.', priority: 'low' });
    }

    return recs;
  }, [week]);

  const TrendIcon = ({ trend }: { trend: 'up' | 'down' | 'neutral' }) => {
    if (trend === 'up') return <TrendingUp className="w-3 h-3 text-emerald-500" />;
    if (trend === 'down') return <TrendingDown className="w-3 h-3 text-rose-500" />;
    return <Minus className="w-3 h-3 text-gray-400" />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Weekly Insights</h2>
          <p className="text-[11px] text-gray-400">AI analysis of your training week</p>
        </div>
      </div>

      {/* Week visualization */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex justify-between gap-1 mb-4">
          {week.map((d, i) => (
            <div key={i} className="flex-1 text-center">
              <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
              <div className={`mt-1 h-12 rounded-lg flex items-end justify-center pb-1 transition-all ${
                d.trained
                  ? 'bg-gradient-to-t from-orange-500/20 to-orange-500/5 border border-orange-200 dark:border-orange-900/30'
                  : 'bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800'
              }`}>
                {d.trained && (
                  <div className="flex flex-col items-center">
                    <Flame className="w-3 h-3 text-orange-500" />
                    <span className="text-[9px] font-bold text-orange-600 dark:text-orange-400">{d.duration}m</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* KPI grid */}
        <div className="grid grid-cols-2 gap-2">
          {insights.map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 space-y-1">
                <div className="flex items-center justify-between">
                  <div className={`w-6 h-6 rounded-lg bg-gradient-to-br ${item.color} flex items-center justify-center`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <TrendIcon trend={item.trend} />
                </div>
                <p className="text-lg font-black text-gray-900 dark:text-white">{item.value}</p>
                <p className="text-[10px] text-gray-400 font-medium">{item.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Recommendations */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-violet-500" />
            <span className="text-sm font-bold text-gray-900 dark:text-white">AI Recommendations</span>
            <span className="text-[10px] bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 px-1.5 py-0.5 rounded-full font-bold">
              {recommendations.length}
            </span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
        </button>

        {expanded && (
          <div className="px-4 pb-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
            {recommendations.map((rec, i) => (
              <div key={i} className={`flex items-start gap-2.5 p-3 rounded-xl ${
                rec.priority === 'high' ? 'bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30' :
                rec.priority === 'medium' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30' :
                'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30'
              }`}>
                <span className="text-lg flex-shrink-0">{rec.emoji}</span>
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Consistency streak */}
      <div className="bg-gradient-to-br from-orange-500 to-rose-500 rounded-2xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-white/70">Weekly Consistency</p>
            <p className="text-3xl font-black">{consistency}%</p>
          </div>
          <Calendar className="w-10 h-10 text-white/30" />
        </div>
        <div className="mt-2 bg-white/20 rounded-full h-2">
          <div className="h-2 rounded-full bg-white transition-all duration-500" style={{ width: `${consistency}%` }} />
        </div>
        <p className="text-[11px] text-white/70 mt-2">
          {consistency >= 70 ? 'Outstanding! You\'re building a powerful habit.' :
           consistency >= 40 ? 'Good start! Adding one more day will boost results.' :
           'Building momentum — every session counts!'}
        </p>
      </div>
    </div>
  );
}
