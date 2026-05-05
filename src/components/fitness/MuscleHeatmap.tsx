/**
 * MuscleHeatmap — Phase 12
 * Interactive body visualization showing muscles trained this week.
 * Uses SVG with per-muscle highlighting based on workout session data.
 */
import React, { useState, useMemo } from 'react';
import { Activity, Flame, ChevronDown, Info } from 'lucide-react';

interface MuscleGroup {
  id: string;
  label: string;
  region: 'upper' | 'core' | 'lower';
  svgPath: string; // Simplified polygon points for front view
}

// Simplified front-body SVG muscle polygons (relative to 200x400 viewBox)
const MUSCLES: MuscleGroup[] = [
  // Upper body
  { id: 'chest', label: 'Chest', region: 'upper', svgPath: 'M72,110 L128,110 L135,140 L100,148 L65,140 Z' },
  { id: 'shoulders', label: 'Shoulders', region: 'upper', svgPath: 'M55,95 L72,110 L65,140 L48,130 Z M145,95 L128,110 L135,140 L152,130 Z' },
  { id: 'biceps', label: 'Biceps', region: 'upper', svgPath: 'M48,130 L58,130 L54,175 L42,175 Z M142,130 L152,130 L158,175 L146,175 Z' },
  { id: 'triceps', label: 'Triceps', region: 'upper', svgPath: 'M38,130 L48,130 L42,175 L32,170 Z M152,130 L162,130 L168,170 L158,175 Z' },
  { id: 'forearms', label: 'Forearms', region: 'upper', svgPath: 'M32,175 L54,175 L48,220 L28,215 Z M146,175 L168,175 L172,215 L152,220 Z' },
  { id: 'traps', label: 'Traps', region: 'upper', svgPath: 'M82,80 L100,75 L118,80 L118,95 L100,100 L82,95 Z' },
  // Core
  { id: 'abdominals', label: 'Abs', region: 'core', svgPath: 'M80,148 L120,148 L118,210 L82,210 Z' },
  { id: 'obliques', label: 'Obliques', region: 'core', svgPath: 'M65,148 L80,148 L82,210 L68,205 Z M120,148 L135,148 L132,205 L118,210 Z' },
  // Lower body
  { id: 'quads', label: 'Quads', region: 'lower', svgPath: 'M72,210 L100,215 L100,290 L68,285 Z M100,215 L128,210 L132,285 L100,290 Z' },
  { id: 'hamstrings', label: 'Hamstrings', region: 'lower', svgPath: 'M68,225 L72,210 L68,285 L62,280 Z M132,210 L128,225 L138,280 L132,285 Z' },
  { id: 'glutes', label: 'Glutes', region: 'lower', svgPath: 'M70,200 L100,210 L130,200 L130,225 L100,230 L70,225 Z' },
  { id: 'calves', label: 'Calves', region: 'lower', svgPath: 'M72,295 L90,290 L85,350 L70,345 Z M110,290 L128,295 L130,345 L115,350 Z' },
];

// Map exercise muscle tags to our muscle IDs
const MUSCLE_MAP: Record<string, string[]> = {
  'chest': ['chest'], 'pectorals': ['chest'], 'pecs': ['chest'],
  'shoulders': ['shoulders'], 'delts': ['shoulders'], 'deltoids': ['shoulders'],
  'biceps': ['biceps'], 'arms': ['biceps', 'triceps'],
  'triceps': ['triceps'],
  'forearms': ['forearms'], 'wrists': ['forearms'],
  'traps': ['traps'], 'trapezius': ['traps'], 'neck': ['traps'],
  'lats': ['traps'], 'back': ['traps'],
  'abdominals': ['abdominals'], 'abs': ['abdominals'], 'core': ['abdominals', 'obliques'],
  'obliques': ['obliques'],
  'quadriceps': ['quads'], 'quads': ['quads'], 'legs': ['quads', 'hamstrings', 'calves'],
  'hamstrings': ['hamstrings'],
  'glutes': ['glutes'], 'gluteals': ['glutes'],
  'calves': ['calves'],
  'full body': ['chest', 'shoulders', 'abdominals', 'quads', 'glutes'],
};

function getIntensityColor(intensity: number): string {
  if (intensity === 0) return '#f3f4f6'; // gray-100
  if (intensity <= 2) return '#bef264';  // lime-300
  if (intensity <= 4) return '#84cc16';  // lime-500
  if (intensity <= 6) return '#f59e0b';  // amber-500
  if (intensity <= 8) return '#f97316';  // orange-500
  return '#ef4444';                       // red-500
}

interface Props {
  /** Array of muscle names hit this week (from workout sessions) */
  musclesWorked?: string[];
  /** Optional: pass counts per muscle for intensity mapping */
  muscleCounts?: Record<string, number>;
}

export default function MuscleHeatmap({ musclesWorked = [], muscleCounts = {} }: Props) {
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);
  const [showLegend, setShowLegend] = useState(false);

  // Compute intensity per muscle from raw muscle names
  const intensityMap = useMemo(() => {
    const map: Record<string, number> = {};
    MUSCLES.forEach(m => { map[m.id] = 0; });

    // If explicit counts provided, use those
    if (Object.keys(muscleCounts).length > 0) {
      Object.entries(muscleCounts).forEach(([muscle, count]) => {
        const normalized = muscle.toLowerCase().trim();
        const targets = MUSCLE_MAP[normalized] || [];
        targets.forEach(t => { map[t] = (map[t] || 0) + count; });
      });
    } else {
      // Count from raw muscle names
      musclesWorked.forEach(muscle => {
        const normalized = muscle.toLowerCase().trim();
        const targets = MUSCLE_MAP[normalized] || [];
        targets.forEach(t => { map[t] = (map[t] || 0) + 1; });
      });
    }
    return map;
  }, [musclesWorked, muscleCounts]);

  const totalMusclesHit = MUSCLES.filter(m => intensityMap[m.id] > 0).length;
  const maxIntensity = Math.max(1, ...Object.values(intensityMap));

  // Demo data if nothing provided
  const hasData = totalMusclesHit > 0;
  const demoMap: Record<string, number> = hasData ? intensityMap : {
    chest: 6, shoulders: 4, biceps: 5, triceps: 3, abdominals: 4, quads: 7, glutes: 5, calves: 2, hamstrings: 3,
  };
  const displayMap = hasData ? intensityMap : demoMap;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-rose-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Muscle Heatmap</h2>
            <p className="text-[11px] text-gray-400">
              {hasData ? `${totalMusclesHit}/${MUSCLES.length} muscle groups hit this week` : 'Demo view — start tracking to see your data'}
            </p>
          </div>
        </div>
        <button onClick={() => setShowLegend(!showLegend)}
          className="text-gray-400 hover:text-orange-500 transition-colors p-1">
          <Info className="w-4 h-4" />
        </button>
      </div>

      {/* Body SVG */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <svg viewBox="0 0 200 370" className="w-full max-w-[240px] mx-auto" style={{ height: 'auto' }}>
          {/* Body outline */}
          <ellipse cx="100" cy="55" rx="25" ry="30" fill="none" stroke="#d1d5db" strokeWidth="1.5" className="dark:stroke-gray-600" />
          <path d="M75,80 Q55,90 45,130 L30,220 L50,225 L55,180 L65,150 L75,210 L70,290 L65,350 L85,355 L95,290 L100,260 L105,290 L115,355 L135,350 L130,290 L125,210 L135,150 L145,180 L150,225 L170,220 L155,130 Q145,90 125,80 Z"
            fill="none" stroke="#d1d5db" strokeWidth="1.5" className="dark:stroke-gray-600" />

          {/* Muscle groups */}
          {MUSCLES.map(m => {
            const intensity = displayMap[m.id] || 0;
            const normalizedIntensity = Math.min(10, Math.round((intensity / Math.max(1, Math.max(...Object.values(displayMap)))) * 10));
            const isHovered = hoveredMuscle === m.id;
            const fillColor = intensity > 0 ? getIntensityColor(normalizedIntensity) : '#f3f4f6';

            return (
              <g key={m.id}>
                <path
                  d={m.svgPath}
                  fill={fillColor}
                  fillOpacity={intensity > 0 ? 0.85 : 0.3}
                  stroke={isHovered ? '#f97316' : intensity > 0 ? fillColor : '#e5e7eb'}
                  strokeWidth={isHovered ? 2.5 : 1}
                  className="cursor-pointer transition-all duration-200"
                  onMouseEnter={() => setHoveredMuscle(m.id)}
                  onMouseLeave={() => setHoveredMuscle(null)}
                  onTouchStart={() => setHoveredMuscle(m.id)}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover tooltip */}
        {hoveredMuscle && (
          <div className="mt-2 text-center animate-in fade-in duration-150">
            <span className="text-sm font-black text-gray-900 dark:text-white">
              {MUSCLES.find(m => m.id === hoveredMuscle)?.label}
            </span>
            <span className="text-xs text-gray-500 ml-2">
              {displayMap[hoveredMuscle] || 0} sets this week
            </span>
          </div>
        )}
      </div>

      {/* Muscle breakdown */}
      <div className="grid grid-cols-2 gap-1.5">
        {MUSCLES.filter(m => displayMap[m.id] > 0).sort((a, b) => (displayMap[b.id] || 0) - (displayMap[a.id] || 0)).map(m => {
          const intensity = displayMap[m.id] || 0;
          const pct = Math.round((intensity / Math.max(1, Math.max(...Object.values(displayMap)))) * 100);
          return (
            <div key={m.id} className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 rounded-lg px-2.5 py-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: getIntensityColor(Math.round(pct / 10)) }} />
              <span className="text-[11px] font-semibold text-gray-700 dark:text-gray-300 flex-1">{m.label}</span>
              <span className="text-[10px] font-bold text-gray-400">{intensity}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-3 space-y-2">
          <p className="text-xs font-bold text-gray-500">Intensity Scale</p>
          <div className="flex gap-1">
            {[0, 2, 4, 6, 8, 10].map(i => (
              <div key={i} className="flex-1 text-center">
                <div className="h-3 rounded" style={{ backgroundColor: getIntensityColor(i) }} />
                <span className="text-[9px] text-gray-400">{i === 0 ? 'None' : i <= 4 ? 'Low' : i <= 7 ? 'Med' : 'High'}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] text-gray-400">
            Colors reflect relative volume per muscle group. Aim for balanced coverage across all 12 groups.
          </p>
        </div>
      )}

      {/* Coverage assessment */}
      <div className={`rounded-xl p-3 border ${totalMusclesHit >= 10 ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30' : totalMusclesHit >= 6 ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30' : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/30'}`}>
        <p className={`text-xs font-bold ${totalMusclesHit >= 10 ? 'text-emerald-700 dark:text-emerald-400' : totalMusclesHit >= 6 ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}`}>
          {totalMusclesHit >= 10 ? '✅ Excellent Coverage' : totalMusclesHit >= 6 ? '⚠️ Partial Coverage' : '❌ Limited Coverage'}
        </p>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {totalMusclesHit >= 10
            ? 'Great job! You\'re hitting most major muscle groups this week.'
            : `${MUSCLES.length - totalMusclesHit} muscle groups need attention. Consider adding exercises for: ${MUSCLES.filter(m => !displayMap[m.id]).map(m => m.label).slice(0, 3).join(', ')}.`}
        </p>
      </div>
    </div>
  );
}
