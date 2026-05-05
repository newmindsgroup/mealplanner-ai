/**
 * InjuryPreventionEngine — Phase 10 Batch C
 * Flags overtraining patterns, suggests corrective exercises,
 * and provides pre/post-workout mobility routines.
 */
import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, CheckCircle, TrendingDown, Activity, Zap, ChevronDown, RotateCcw } from 'lucide-react';

interface OvertrainingSignal {
  id: string; signal: string; severity: 'low' | 'medium' | 'high';
  description: string; action: string;
}

interface CorrectiveExercise {
  name: string; target: string; duration: string; instructions: string;
}

const MOBILITY_ROUTINES: Record<string, CorrectiveExercise[]> = {
  'Upper Body': [
    { name: 'Band Pull-Aparts', target: 'Rear delts / posture', duration: '3×15', instructions: 'Light band, squeeze shoulder blades' },
    { name: 'Wall Slides', target: 'Shoulder mobility', duration: '2×10', instructions: 'Back against wall, arms in W position, slide up to Y' },
    { name: 'Thoracic Foam Roll', target: 'Upper back', duration: '60 sec', instructions: 'Foam roll between shoulder blades, extend over roller' },
    { name: 'Doorway Pec Stretch', target: 'Chest / anterior shoulder', duration: '30 sec/side', instructions: 'Forearm on doorframe, step through gently' },
  ],
  'Lower Body': [
    { name: '90/90 Hip Switch', target: 'Hip internal/external rotation', duration: '2×8/side', instructions: 'Seated, switch legs between internal and external rotation' },
    { name: 'Couch Stretch', target: 'Hip flexors / quads', duration: '60 sec/side', instructions: 'Back knee against wall, squeeze glute on stretching side' },
    { name: 'Ankle CARs', target: 'Ankle mobility', duration: '10/direction', instructions: 'Controlled articular rotations, full ROM circles' },
    { name: 'Single-Leg RDL (bodyweight)', target: 'Posterior chain / balance', duration: '2×8/side', instructions: 'Slow and controlled, feel hamstring stretch' },
  ],
  'Core & Spine': [
    { name: 'Dead Bug', target: 'Core stability / anti-extension', duration: '3×8/side', instructions: 'Press lower back into floor, opposite arm/leg extend' },
    { name: 'Cat-Cow', target: 'Spinal mobility', duration: '10 breaths', instructions: 'Inhale into cow, exhale into cat, smooth transitions' },
    { name: 'Bird Dog', target: 'Core stability / anti-rotation', duration: '2×10/side', instructions: 'Extend opposite arm/leg, maintain neutral spine' },
    { name: 'Side Plank', target: 'Lateral core / obliques', duration: '30 sec/side', instructions: 'Stack hips, straight line from head to feet' },
  ],
};

function analyzeOvertraining(sessionsPerWeek: number, avgSoreness: number, avgStress: number, avgSleep: number): OvertrainingSignal[] {
  const signals: OvertrainingSignal[] = [];

  if (sessionsPerWeek > 6) {
    signals.push({ id: 'freq', signal: 'High Training Frequency', severity: 'high',
      description: `${sessionsPerWeek} sessions/week with insufficient rest days. Most athletes need 1-2 full rest days.`,
      action: 'Add a rest day. Consider active recovery (walking, yoga) instead of training.' });
  } else if (sessionsPerWeek >= 5) {
    signals.push({ id: 'freq', signal: 'High Training Volume', severity: 'medium',
      description: `${sessionsPerWeek} sessions/week. Monitor recovery markers closely.`,
      action: 'Ensure at least 1 complete rest day per week. Deload every 4-6 weeks.' });
  }

  if (avgSoreness >= 7) {
    signals.push({ id: 'sore', signal: 'Chronic Soreness', severity: 'high',
      description: `Average soreness ${avgSoreness}/10. Persistent DOMS suggests insufficient recovery.`,
      action: 'Reduce training intensity by 20% this week. Prioritize sleep, protein intake, and foam rolling.' });
  } else if (avgSoreness >= 5) {
    signals.push({ id: 'sore', signal: 'Moderate Soreness', severity: 'medium',
      description: `Average soreness ${avgSoreness}/10. Some DOMS is normal but monitor trends.`,
      action: 'Ensure 48 hours between training the same muscle group. Add 5 min cool-down stretching.' });
  }

  if (avgStress >= 7) {
    signals.push({ id: 'stress', signal: 'Elevated Stress', severity: 'high',
      description: `Avg stress ${avgStress}/10. High cortisol impairs recovery and muscle growth.`,
      action: 'Consider breathwork (4-7-8 technique), reduce training volume, prioritize sleep quality.' });
  }

  if (avgSleep < 6) {
    signals.push({ id: 'sleep', signal: 'Sleep Deficit', severity: 'high',
      description: `Average ${avgSleep}h sleep. Growth hormone and recovery peak during deep sleep.`,
      action: 'Target 7-9 hours. Reduce screen time before bed. Consider magnesium supplement.' });
  } else if (avgSleep < 7) {
    signals.push({ id: 'sleep', signal: 'Borderline Sleep', severity: 'medium',
      description: `Average ${avgSleep}h sleep. Aim for 7-9 hours for optimal recovery.`,
      action: 'Maintain consistent sleep/wake times. Cool, dark room. No caffeine after 2 PM.' });
  }

  if (signals.length === 0) {
    signals.push({ id: 'good', signal: 'Recovery Looks Good', severity: 'low',
      description: 'No overtraining signals detected. Your training-recovery balance is healthy.',
      action: 'Keep up current routine. Consider progressive overload if strength has plateaued.' });
  }

  return signals;
}

export default function InjuryPreventionEngine() {
  const [sessionsPerWeek, setSessionsPerWeek] = useState(4);
  const [avgSoreness, setAvgSoreness] = useState(4);
  const [avgStress, setAvgStress] = useState(4);
  const [avgSleep, setAvgSleep] = useState(7);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  const signals = analyzeOvertraining(sessionsPerWeek, avgSoreness, avgStress, avgSleep);
  const highCount = signals.filter(s => s.severity === 'high').length;
  const riskLevel = highCount >= 2 ? 'High Risk' : highCount === 1 ? 'Caution' : 'Low Risk';
  const riskColor = highCount >= 2 ? 'text-rose-600' : highCount === 1 ? 'text-amber-600' : 'text-emerald-600';
  const riskBg = highCount >= 2 ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40' : highCount === 1 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/40' : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40';

  const sevColor: Record<string, string> = {
    high: 'bg-rose-100 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400',
    medium: 'bg-amber-100 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
    low: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-red-500 rounded-xl flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Injury Prevention</h2>
          <p className="text-[11px] text-gray-400">Overtraining detection & corrective exercises</p>
        </div>
      </div>

      {/* Risk summary */}
      <div className={`${riskBg} border rounded-2xl p-4 text-center`}>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Injury Risk Level</p>
        <p className={`text-2xl font-black ${riskColor}`}>{riskLevel}</p>
        <p className="text-xs text-gray-500 mt-1">{signals.length} signal{signals.length !== 1 ? 's' : ''} detected</p>
      </div>

      {/* Quick inputs */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
        <p className="text-xs font-bold text-gray-500 mb-1">📊 Your Recent Averages</p>
        {[
          { label: 'Sessions/week', val: sessionsPerWeek, set: setSessionsPerWeek, min: 1, max: 7, emoji: '🏋️' },
          { label: 'Avg Soreness', val: avgSoreness, set: setAvgSoreness, min: 1, max: 10, emoji: '💪' },
          { label: 'Avg Stress', val: avgStress, set: setAvgStress, min: 1, max: 10, emoji: '😰' },
          { label: 'Avg Sleep (hrs)', val: avgSleep, set: setAvgSleep, min: 4, max: 10, emoji: '🛏️' },
        ].map(({ label, val, set, min, max, emoji }) => (
          <div key={label}>
            <div className="flex justify-between mb-0.5">
              <span className="text-[11px] font-bold text-gray-500">{emoji} {label}</span>
              <span className="text-[11px] font-black text-gray-900 dark:text-white">{val}</span>
            </div>
            <input type="range" min={min} max={max} step={label.includes('Sleep') ? 0.5 : 1} value={val}
              onChange={e => set(Number(e.target.value))}
              className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer accent-orange-500" />
          </div>
        ))}
      </div>

      {/* Signals */}
      <div className="space-y-2">
        {signals.map(s => (
          <div key={s.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
            <div className="flex items-start gap-2">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${sevColor[s.severity]}`}>{s.severity.toUpperCase()}</span>
              <div className="flex-1">
                <p className="text-xs font-bold text-gray-900 dark:text-white">{s.signal}</p>
                <p className="text-[11px] text-gray-500 mt-0.5">{s.description}</p>
                <p className="text-[11px] text-orange-600 dark:text-orange-400 font-semibold mt-1">→ {s.action}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobility routines */}
      <div className="space-y-2">
        <p className="text-xs font-bold text-gray-500">🧘 Corrective Mobility Routines</p>
        {Object.entries(MOBILITY_ROUTINES).map(([area, exercises]) => (
          <div key={area} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
            <button onClick={() => setExpandedRoutine(expandedRoutine === area ? null : area)}
              className="w-full flex items-center gap-2 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
              <Activity className="w-4 h-4 text-orange-500" />
              <span className="font-bold text-sm text-gray-900 dark:text-white flex-1">{area}</span>
              <span className="text-[10px] text-gray-400">{exercises.length} exercises</span>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expandedRoutine === area ? 'rotate-180' : ''}`} />
            </button>
            {expandedRoutine === area && (
              <div className="px-4 pb-3 space-y-2 border-t border-gray-50 dark:border-gray-700 pt-2">
                {exercises.map((ex, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-xs font-bold text-gray-700 dark:text-gray-300">{ex.name} <span className="font-normal text-gray-400">· {ex.duration}</span></p>
                      <p className="text-[10px] text-gray-400">{ex.target}</p>
                      <p className="text-[10px] text-gray-500 italic mt-0.5">{ex.instructions}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
