/**
 * AdaptivePeriodization — Phase 10 Batch C
 * AI auto-adjusts training plan based on readiness score, completion rate, and trends.
 * Implements undulating periodization: intensity cycles across weeks.
 */
import React, { useState, useMemo } from 'react';
import { Brain, TrendingUp, TrendingDown, Minus, Zap, AlertCircle, RefreshCw, ChevronRight, Flame, Shield } from 'lucide-react';

interface WeekData {
  week: number;
  phase: 'volume' | 'intensity' | 'deload' | 'peak';
  volumeMultiplier: number;   // 0.5–1.2
  intensityMultiplier: number; // 0.6–1.1
  focus: string;
  description: string;
  color: string;
}

function generateMesocycle(
  currentWeek: number,
  readinessScore: number,
  completionRate: number,
  weeksTraining: number,
): WeekData[] {
  const weeks: WeekData[] = [];
  const needsDeload = weeksTraining > 0 && weeksTraining % 4 === 0;
  const isOverreaching = readinessScore < 45 || completionRate < 0.6;

  for (let i = 0; i < 4; i++) {
    const wk = currentWeek + i;
    let phase: WeekData['phase'];
    let vol: number;
    let intensity: number;
    let focus: string;
    let desc: string;
    let color: string;

    if (i === 0 && isOverreaching) {
      phase = 'deload'; vol = 0.5; intensity = 0.6; focus = 'Recovery';
      desc = 'Forced deload — readiness or completion too low. Focus on mobility, light movement.';
      color = 'from-blue-400 to-cyan-500';
    } else if (i === 0 && needsDeload) {
      phase = 'deload'; vol = 0.6; intensity = 0.7; focus = 'Active Recovery';
      desc = 'Scheduled deload after 4 weeks. Reduce sets by 40%, weight by 30%. Focus on form.';
      color = 'from-blue-400 to-cyan-500';
    } else {
      // Undulating: volume → intensity → peak → deload
      const cyclePos = (wk - 1) % 4;
      if (cyclePos === 0) {
        phase = 'volume'; vol = 1.0; intensity = 0.75; focus = 'Hypertrophy';
        desc = 'High volume, moderate weight. 3-4 sets of 8-12 reps. Build work capacity.';
        color = 'from-emerald-400 to-teal-500';
      } else if (cyclePos === 1) {
        phase = 'intensity'; vol = 0.85; intensity = 0.9; focus = 'Strength';
        desc = 'Moderate volume, heavier weight. 4-5 sets of 4-6 reps. Progressive overload.';
        color = 'from-orange-400 to-amber-500';
      } else if (cyclePos === 2) {
        phase = 'peak'; vol = 0.7; intensity = 1.0; focus = 'Peak Performance';
        desc = 'Low volume, max intensity. 3-5 sets of 1-3 reps. Test new PRs.';
        color = 'from-rose-400 to-red-500';
      } else {
        phase = 'deload'; vol = 0.6; intensity = 0.65; focus = 'Recovery';
        desc = 'Deload week. 50% volume, 65% intensity. Let your body supercompensate.';
        color = 'from-blue-400 to-cyan-500';
      }
    }

    // Adjust based on readiness
    if (readinessScore < 50 && phase !== 'deload') {
      vol *= 0.85;
      intensity *= 0.9;
      desc += ' (Adjusted down due to low readiness.)';
    } else if (readinessScore > 80 && phase !== 'deload') {
      vol *= 1.05;
      intensity *= 1.02;
    }

    weeks.push({ week: wk, phase, volumeMultiplier: Math.round(vol * 100) / 100, intensityMultiplier: Math.round(intensity * 100) / 100, focus, description: desc, color });
  }
  return weeks;
}

const PHASE_ICONS: Record<string, React.ReactNode> = {
  volume: <TrendingUp className="w-4 h-4 text-emerald-500" />,
  intensity: <Flame className="w-4 h-4 text-orange-500" />,
  peak: <Zap className="w-4 h-4 text-rose-500" />,
  deload: <Shield className="w-4 h-4 text-blue-500" />,
};

export default function AdaptivePeriodization() {
  const [readiness, setReadiness] = useState(72);
  const [completionRate, setCompletionRate] = useState(85);
  const [weeksTraining, setWeeksTraining] = useState(6);

  const mesocycle = useMemo(
    () => generateMesocycle(weeksTraining + 1, readiness, completionRate / 100, weeksTraining),
    [readiness, completionRate, weeksTraining]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Adaptive Periodization</h2>
          <p className="text-[11px] text-gray-400">AI auto-adjusts your 4-week training block</p>
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500">📊 Current State</p>
        {[
          { label: 'Readiness Score', val: readiness, set: setReadiness, min: 0, max: 100, unit: '/100', accent: 'accent-violet-500' },
          { label: 'Completion Rate', val: completionRate, set: setCompletionRate, min: 0, max: 100, unit: '%', accent: 'accent-emerald-500' },
          { label: 'Weeks Training', val: weeksTraining, set: setWeeksTraining, min: 1, max: 24, unit: 'wk', accent: 'accent-orange-500' },
        ].map(({ label, val, set, min, max, unit, accent }) => (
          <div key={label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[11px] font-bold text-gray-500">{label}</span>
              <span className="text-[11px] font-black text-gray-900 dark:text-white">{val}{unit}</span>
            </div>
            <input type="range" min={min} max={max} value={val}
              onChange={e => set(Number(e.target.value))}
              className={`w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer ${accent}`} />
          </div>
        ))}
      </div>

      {/* 4-week plan */}
      <div className="space-y-2">
        {mesocycle.map((wk, i) => (
          <div key={wk.week} className={`bg-white dark:bg-gray-800 rounded-2xl border overflow-hidden ${i === 0 ? 'border-orange-300 dark:border-orange-900/40 shadow-md' : 'border-gray-100 dark:border-gray-700'}`}>
            <div className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                {PHASE_ICONS[wk.phase]}
                <span className="font-black text-sm text-gray-900 dark:text-white">Week {wk.week}</span>
                <span className={`text-[10px] font-bold bg-gradient-to-r ${wk.color} text-white px-2 py-0.5 rounded-lg uppercase`}>{wk.phase}</span>
                {i === 0 && <span className="text-[9px] bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-1.5 py-0.5 rounded font-bold">THIS WEEK</span>}
              </div>
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{wk.focus}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{wk.description}</p>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Vol: {Math.round(wk.volumeMultiplier * 100)}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-orange-500" />
                  <span className="text-[10px] font-bold text-gray-600 dark:text-gray-400">Int: {Math.round(wk.intensityMultiplier * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-adjust info */}
      <div className="bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30 rounded-xl p-3">
        <p className="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1"><Brain className="w-3 h-3" /> How it works</p>
        <p className="text-xs text-violet-600/80 dark:text-violet-400/60 mt-0.5 leading-relaxed">
          Undulating periodization cycles through volume → intensity → peak → deload every 4 weeks.
          If readiness drops below 45 or completion rate below 60%, a forced deload is triggered.
          High readiness (&gt;80) slightly increases volume and intensity for optimal progress.
        </p>
      </div>
    </div>
  );
}
