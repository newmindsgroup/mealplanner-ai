/**
 * ProgressCharts — Pure SVG line + bar charts. Phase 7.
 * Weight, body fat, measurements, PR history. No external chart lib.
 */
import React, { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Scale, Percent, Ruler, Trophy } from 'lucide-react';
import type { BodyMeasurement, PersonalRecord } from '../../services/fitnessService';

// ── SVG line chart ─────────────────────────────────────────────────────────────
function LineChart({ data, color = '#f97316', height = 120 }: { data: { date: string; value: number }[]; color?: string; height?: number }) {
  if (data.length < 2) return <div className="flex items-center justify-center h-20 text-xs text-gray-300">Need 2+ data points</div>;
  const W = 400; const H = height;
  const P = { t: 10, r: 10, b: 24, l: 36 };
  const iW = W - P.l - P.r; const iH = H - P.t - P.b;
  const vals = data.map(d => d.value);
  const mn = Math.min(...vals); const mx = Math.max(...vals); const rng = mx - mn || 1;
  const xS = (i: number) => P.l + (i / (data.length - 1)) * iW;
  const yS = (v: number) => P.t + iH - ((v - mn) / rng) * iH;
  const pts = data.map((d, i) => `${xS(i)},${yS(d.value)}`).join(' ');
  const area = [`${xS(0)},${P.t + iH}`, ...data.map((d, i) => `${xS(i)},${yS(d.value)}`), `${xS(data.length - 1)},${P.t + iH}`].join(' ');
  const fmt = (s: string) => { const d = new Date(s); return `${d.getMonth() + 1}/${d.getDate()}`; };
  const gid = `g${color.replace(/\W/g, '')}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#${gid})`} />
      {[mn, mn + rng * 0.5, mx].map((v, i) => (
        <g key={i}>
          <line x1={P.l} y1={yS(v)} x2={P.l + iW} y2={yS(v)} stroke="#e5e7eb" strokeWidth="0.5" strokeDasharray="4,4" />
          <text x={P.l - 4} y={yS(v) + 4} textAnchor="end" fontSize="9" fill="#9ca3af">{v % 1 === 0 ? v : v.toFixed(1)}</text>
        </g>
      ))}
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {data.map((d, i) => <circle key={i} cx={xS(i)} cy={yS(d.value)} r="3.5" fill={color} stroke="white" strokeWidth="1.5" />)}
      {[0, Math.floor((data.length - 1) / 2), data.length - 1].map(i => (
        <text key={i} x={xS(i)} y={H - 4} textAnchor="middle" fontSize="9" fill="#9ca3af">{fmt(data[i].date)}</text>
      ))}
    </svg>
  );
}

// ── Bar chart ──────────────────────────────────────────────────────────────────
function BarChart({ data, color = '#8b5cf6', unit = '', height = 100 }: { data: { date: string; value: number }[]; color?: string; unit?: string; height?: number }) {
  if (!data.length) return null;
  const W = 400; const H = height;
  const P = { t: 16, r: 10, b: 20, l: 10 };
  const iW = W - P.l - P.r; const iH = H - P.t - P.b;
  const mx = Math.max(...data.map(d => d.value), 1);
  const gap = iW / data.length;
  const bW = Math.max(8, gap * 0.65);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height }}>
      {data.map((d, i) => {
        const bH = (d.value / mx) * iH;
        const x = P.l + gap * i + gap / 2 - bW / 2;
        const y = P.t + iH - bH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={bH} rx="3" fill={color} opacity="0.8" />
            <text x={x + bW / 2} y={y - 3} textAnchor="middle" fontSize="8" fill={color}>{d.value}{unit}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Metric card ────────────────────────────────────────────────────────────────
function MetricCard({ label, current, prev, unit, icon: Icon, gradient, children }: {
  label: string; current: number | null; prev?: number | null; unit: string;
  icon: React.ElementType; gradient: string; children?: React.ReactNode;
}) {
  const delta = current != null && prev != null ? current - prev : null;
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 ${gradient} rounded-lg flex items-center justify-center`}>
            <Icon className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-sm text-gray-900 dark:text-white">{label}</span>
        </div>
        <div className="text-right">
          <p className="font-black text-lg text-gray-900 dark:text-white leading-none">{current != null ? `${current}${unit}` : '—'}</p>
          {delta != null && (
            <div className={`flex items-center gap-0.5 justify-end text-xs font-semibold ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-rose-500' : 'text-gray-400'}`}>
              {delta > 0 ? <TrendingUp className="w-3 h-3" /> : delta < 0 ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
              {Math.abs(delta).toFixed(1)}{unit}
            </div>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
type TimeRange = '1m' | '3m' | '6m' | '1y' | 'all';
const RANGES = [
  { id: '1m' as TimeRange, label: '1M', days: 30 },
  { id: '3m' as TimeRange, label: '3M', days: 90 },
  { id: '6m' as TimeRange, label: '6M', days: 180 },
  { id: '1y' as TimeRange, label: '1Y', days: 365 },
  { id: 'all' as TimeRange, label: 'All', days: Infinity },
];

interface Props {
  measurements: BodyMeasurement[];
  records: PersonalRecord[];
  personId?: string;
  personName?: string;
}

export default function ProgressCharts({ measurements, records, personId, personName }: Props) {
  const [range, setRange] = useState<TimeRange>('3m');
  const cutoff = useMemo(() => {
    const days = RANGES.find(r => r.id === range)!.days;
    if (!isFinite(days)) return new Date(0);
    const d = new Date(); d.setDate(d.getDate() - days); return d;
  }, [range]);

  const filtered = useMemo(() =>
    measurements.filter(m => new Date(m.measured_at || m.created_at || '') >= cutoff)
      .sort((a, b) => new Date(a.measured_at || '').getTime() - new Date(b.measured_at || '').getTime()),
    [measurements, cutoff]);

  const toData = (key: keyof BodyMeasurement) =>
    filtered.filter(m => m[key] != null).map(m => ({ date: m.measured_at || m.created_at || '', value: m[key] as number }));

  const weightData = toData('weight_kg');
  const fatData = toData('body_fat_pct');
  const waistData = toData('waist_cm');

  const prsByEx = useMemo(() => {
    const map: Record<string, { date: string; value: number; unit: string }[]> = {};
    records.forEach(r => {
      if (!map[r.exercise_name]) map[r.exercise_name] = [];
      map[r.exercise_name].push({ date: r.set_at || r.created_at || '', value: r.value, unit: r.unit || '' });
    });
    return map;
  }, [records]);

  const hasData = weightData.length > 0 || fatData.length > 0 || Object.keys(prsByEx).length > 0;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-base">
            {personName ? `${personName.split(' ')[0]}'s Progress` : 'Progress Charts'}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">Measurements & personal records over time</p>
        </div>
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {RANGES.map(r => (
            <button key={r.id} onClick={() => setRange(r.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${range === r.id ? 'bg-white dark:bg-gray-700 text-orange-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}>
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 text-gray-200 dark:text-gray-700" />
          <p className="font-bold text-sm text-gray-900 dark:text-white">No progress data yet</p>
          <p className="text-xs text-gray-400 mt-1">Log measurements in the Progress tab to start tracking.</p>
        </div>
      ) : (
        <>
          {(weightData.length > 0 || fatData.length > 0) && (
            <div className="grid md:grid-cols-2 gap-4">
              {weightData.length > 0 && (
                <MetricCard label="Weight" current={weightData.at(-1)?.value ?? null} prev={weightData.at(-2)?.value ?? null} unit=" kg" icon={Scale} gradient="bg-gradient-to-br from-orange-400 to-rose-500">
                  <LineChart data={weightData} color="#f97316" />
                </MetricCard>
              )}
              {fatData.length > 0 && (
                <MetricCard label="Body Fat %" current={fatData.at(-1)?.value ?? null} prev={fatData.at(-2)?.value ?? null} unit="%" icon={Percent} gradient="bg-gradient-to-br from-violet-400 to-purple-500">
                  <LineChart data={fatData} color="#8b5cf6" />
                </MetricCard>
              )}
            </div>
          )}
          {waistData.length > 0 && (
            <MetricCard label="Waist" current={waistData.at(-1)?.value ?? null} prev={waistData.at(-2)?.value ?? null} unit=" cm" icon={Ruler} gradient="bg-gradient-to-br from-teal-400 to-emerald-500">
              <LineChart data={waistData} color="#14b8a6" />
            </MetricCard>
          )}
          {Object.keys(prsByEx).length > 0 && (
            <div className="space-y-3">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white flex items-center gap-2">
                <Trophy className="w-4 h-4 text-yellow-500" /> Personal Records
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {Object.entries(prsByEx).slice(0, 6).map(([name, hist]) => (
                  <div key={name} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-bold text-sm text-gray-900 dark:text-white">{name}</p>
                      <span className="text-xs font-black text-violet-600">{hist.at(-1)?.value} {hist.at(-1)?.unit}</span>
                    </div>
                    <BarChart data={hist.slice(-8)} color="#8b5cf6" unit={hist[0]?.unit || ''} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
