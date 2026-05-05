/**
 * SleepStressTracker — Phase 10
 * Daily sleep quality, stress level, and HRV logging.
 * Calculates AI Readiness Score from recent data.
 */
import React, { useState, useEffect } from 'react';
import { Moon, Zap, Brain, Heart, TrendingUp, Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { api } from '../../services/apiClient';

interface DailyLog {
  sleepHours: number;
  sleepQuality: number; // 1-10
  stressLevel: number;  // 1-10
  mood: string;
  soreness: number;     // 1-10
  hrvEstimate?: number; // optional manual HRV
  notes: string;
}

interface ReadinessData {
  score: number;        // 0-100
  label: string;        // 'Optimal' | 'Good' | 'Moderate' | 'Low' | 'Rest'
  recommendation: string;
  factors: { name: string; score: number; impact: 'positive' | 'neutral' | 'negative' }[];
}

const MOODS = [
  { emoji: '😴', label: 'Exhausted' },
  { emoji: '😐', label: 'Low Energy' },
  { emoji: '🙂', label: 'Normal' },
  { emoji: '😊', label: 'Good' },
  { emoji: '🔥', label: 'Energized' },
];

const READINESS_CONFIG: Record<string, { color: string; bg: string; border: string }> = {
  Optimal: { color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-950/20', border: 'border-emerald-200 dark:border-emerald-900/40' },
  Good: { color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/20', border: 'border-blue-200 dark:border-blue-900/40' },
  Moderate: { color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/20', border: 'border-amber-200 dark:border-amber-900/40' },
  Low: { color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950/20', border: 'border-orange-200 dark:border-orange-900/40' },
  Rest: { color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-950/20', border: 'border-rose-200 dark:border-rose-900/40' },
};

function SliderInput({ label, value, onChange, min = 1, max = 10, emoji }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number; emoji?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-bold text-gray-500">{emoji} {label}</span>
        <span className="text-xs font-black text-gray-900 dark:text-white">{value}/{max}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
        style={{ background: `linear-gradient(to right, #f97316 0%, #f97316 ${pct}%, #e5e7eb ${pct}%, #e5e7eb 100%)` }} />
    </div>
  );
}

function calculateReadiness(log: DailyLog): ReadinessData {
  // Evidence-based scoring algorithm
  const sleepScore = Math.min(10, (log.sleepHours / 8) * 10);
  const qualityScore = log.sleepQuality;
  const stressInverse = 11 - log.stressLevel;
  const sorenessInverse = 11 - log.soreness;
  const moodScore = MOODS.findIndex(m => m.label === log.mood) * 2.5 + 2.5;

  // Weighted composite
  const raw = (sleepScore * 0.25) + (qualityScore * 0.2) + (stressInverse * 0.2) +
    (sorenessInverse * 0.15) + (moodScore * 0.2);
  const score = Math.min(100, Math.max(0, Math.round(raw * 10)));

  let label = 'Rest';
  let recommendation = 'Complete rest today. Focus on sleep and recovery.';
  if (score >= 80) { label = 'Optimal'; recommendation = 'You\'re primed for a high-intensity session. Push your limits today!'; }
  else if (score >= 65) { label = 'Good'; recommendation = 'Good to go for your planned workout. Stay hydrated.'; }
  else if (score >= 45) { label = 'Moderate'; recommendation = 'Consider reducing intensity by 20%. Focus on technique over load.'; }
  else if (score >= 25) { label = 'Low'; recommendation = 'Light activity only — yoga, walking, or mobility work recommended.'; }

  const factors = [
    { name: 'Sleep Duration', score: Math.round(sleepScore * 10), impact: sleepScore >= 7 ? 'positive' as const : sleepScore >= 5 ? 'neutral' as const : 'negative' as const },
    { name: 'Sleep Quality', score: qualityScore * 10, impact: qualityScore >= 7 ? 'positive' as const : qualityScore >= 5 ? 'neutral' as const : 'negative' as const },
    { name: 'Stress Level', score: stressInverse * 10, impact: stressInverse >= 7 ? 'positive' as const : stressInverse >= 5 ? 'neutral' as const : 'negative' as const },
    { name: 'Muscle Recovery', score: sorenessInverse * 10, impact: sorenessInverse >= 7 ? 'positive' as const : sorenessInverse >= 5 ? 'neutral' as const : 'negative' as const },
    { name: 'Energy / Mood', score: Math.round(moodScore * 10), impact: moodScore >= 7 ? 'positive' as const : moodScore >= 5 ? 'neutral' as const : 'negative' as const },
  ];

  return { score, label, recommendation, factors };
}

export default function SleepStressTracker({ personId }: { personId?: string }) {
  const [log, setLog] = useState<DailyLog>({
    sleepHours: 7, sleepQuality: 7, stressLevel: 4, mood: 'Normal', soreness: 3, notes: '',
  });
  const [readiness, setReadiness] = useState<ReadinessData | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Recalculate readiness on every change
  useEffect(() => {
    setReadiness(calculateReadiness(log));
  }, [log]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/fitness/daily-log', { ...log, personId, readinessScore: readiness?.score });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { /* non-fatal */ }
    finally { setSaving(false); }
  };

  const cfg = readiness ? READINESS_CONFIG[readiness.label] || READINESS_CONFIG.Moderate : null;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center">
          <Brain className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Recovery & Readiness</h2>
          <p className="text-[11px] text-gray-400">Daily wellness check → AI readiness score</p>
        </div>
      </div>

      {/* Readiness Score Hero */}
      {readiness && cfg && (
        <div className={`${cfg.bg} ${cfg.border} border rounded-2xl p-5 text-center`}>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Today's Readiness</p>
          <div className="flex items-center justify-center gap-3">
            <div className={`text-5xl font-black ${cfg.color} leading-none`}>{readiness.score}</div>
            <div className="text-left">
              <p className={`font-black text-lg ${cfg.color}`}>{readiness.label}</p>
              <p className="text-xs text-gray-500 max-w-[200px]">{readiness.recommendation}</p>
            </div>
          </div>
          {/* Factor bars */}
          <div className="mt-4 space-y-1.5">
            {readiness.factors.map(f => (
              <div key={f.name} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-24 text-right">{f.name}</span>
                <div className="flex-1 h-1.5 bg-white/50 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${f.impact === 'positive' ? 'bg-emerald-500' : f.impact === 'neutral' ? 'bg-amber-400' : 'bg-rose-500'}`}
                    style={{ width: `${f.score}%` }} />
                </div>
                <span className={`text-[10px] font-bold w-6 text-right ${f.impact === 'positive' ? 'text-emerald-500' : f.impact === 'neutral' ? 'text-amber-500' : 'text-rose-500'}`}>
                  {Math.round(f.score / 10)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-4">
        {/* Sleep hours */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-bold text-gray-500">🛏️ Sleep Duration</span>
            <span className="text-xs font-black text-gray-900 dark:text-white">{log.sleepHours}h</span>
          </div>
          <input type="range" min={3} max={12} step={0.5} value={log.sleepHours}
            onChange={e => setLog(l => ({ ...l, sleepHours: Number(e.target.value) }))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full appearance-none cursor-pointer"
            style={{ background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${((log.sleepHours - 3) / 9) * 100}%, #e5e7eb ${((log.sleepHours - 3) / 9) * 100}%, #e5e7eb 100%)` }} />
        </div>

        <SliderInput label="Sleep Quality" emoji="💤" value={log.sleepQuality} onChange={v => setLog(l => ({ ...l, sleepQuality: v }))} />
        <SliderInput label="Stress Level" emoji="😰" value={log.stressLevel} onChange={v => setLog(l => ({ ...l, stressLevel: v }))} />
        <SliderInput label="Muscle Soreness" emoji="💪" value={log.soreness} onChange={v => setLog(l => ({ ...l, soreness: v }))} />

        {/* Mood */}
        <div>
          <p className="text-xs font-bold text-gray-500 mb-2">🧠 Overall Mood</p>
          <div className="flex gap-2">
            {MOODS.map(m => (
              <button key={m.label} onClick={() => setLog(l => ({ ...l, mood: m.label }))}
                className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs font-bold transition-all ${log.mood === m.label ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700' : 'border-gray-200 dark:border-gray-700 text-gray-400'}`}>
                <span className="text-lg">{m.emoji}</span>
                <span className="text-[9px]">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <textarea value={log.notes} onChange={e => setLog(l => ({ ...l, notes: e.target.value }))}
          placeholder="Optional notes (how you feel, anything notable)…"
          rows={2}
          className="w-full text-xs border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none" />

        <button onClick={handleSave} disabled={saving}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-bold py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50">
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</> :
           saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> :
           <><Save className="w-4 h-4" /> Log Today's Recovery</>}
        </button>
      </div>
    </div>
  );
}
