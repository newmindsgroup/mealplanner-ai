/**
 * EnergyBalance — Cross-references today's meal-plan calories with estimated
 * workout burn to show net energy. Phase 6 feature.
 */
import React, { useState, useEffect } from 'react';
import { Zap, Flame, Apple, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { api } from '../../services/apiClient';

interface EnergyData {
  caloriesIn: number;
  caloriesOut: number;
  net: number;
  tdee: number;
  deficitOrSurplus: 'deficit' | 'surplus' | 'maintenance';
  todayWorkoutName: string | null;
  workoutBurn: number;
  baseBurn: number;
}

function Ring({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(pct / 100, 1) * circ;
  return (
    <svg width={size} height={size} className="rotate-[-90deg]">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={6} className="text-gray-100 dark:text-gray-700" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ}`} className="transition-all duration-700" />
    </svg>
  );
}

export default function EnergyBalance({ personId }: { personId?: string }) {
  const [data, setData] = useState<EnergyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, [personId]);

  const load = async () => {
    setLoading(true);
    try {
      const qs = personId ? `?personId=${personId}` : '';
      const res = await api.get<{ success: boolean; data: EnergyData }>(`/fitness/energy-balance${qs}`);
      setData(res.data);
    } catch {
      // Fallback: construct estimated data from profile
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5">
        <div className="animate-pulse flex gap-4">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full" />
          <div className="flex-1 space-y-2 pt-2">
            <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // If no backend data yet, show an informative placeholder
  if (!data) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Energy Balance</h3>
            <p className="text-[11px] text-gray-400">Calories in vs. out</p>
          </div>
        </div>
        <div className="text-center py-4 text-gray-400">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-30" />
          <p className="text-xs">Log meals and complete workouts to see your energy balance.</p>
        </div>
      </div>
    );
  }

  const netColor = data.net > 200 ? '#10b981' : data.net < -300 ? '#f59e0b' : '#6366f1';
  const netLabel = data.deficitOrSurplus === 'deficit' ? 'Deficit' : data.deficitOrSurplus === 'surplus' ? 'Surplus' : 'Maintenance';
  const netIcon = data.deficitOrSurplus === 'surplus' ? TrendingUp : data.deficitOrSurplus === 'deficit' ? TrendingDown : Minus;
  const NetIcon = netIcon;
  const caloriesInPct = data.tdee > 0 ? (data.caloriesIn / data.tdee) * 100 : 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 dark:text-white text-sm">Energy Balance</h3>
          <p className="text-[11px] text-gray-400">Today · Calories in vs. out</p>
        </div>
      </div>

      {/* Ring + net */}
      <div className="flex items-center gap-4">
        <div className="relative flex-shrink-0">
          <Ring pct={caloriesInPct} color={netColor} size={80} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-base font-black text-gray-900 dark:text-white leading-none">{data.net > 0 ? '+' : ''}{data.net}</span>
            <span className="text-[10px] text-gray-400">kcal net</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { label: 'Calories in', value: data.caloriesIn, icon: Apple, color: 'text-emerald-500' },
            { label: 'Workout burn', value: data.caloriesOut, icon: Flame, color: 'text-orange-500' },
            { label: 'Daily target', value: data.tdee, icon: Zap, color: 'text-violet-500' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon className={`w-3.5 h-3.5 ${color}`} />
                <span className="text-xs text-gray-500">{label}</span>
              </div>
              <span className="text-xs font-bold text-gray-900 dark:text-white">{value} kcal</span>
            </div>
          ))}
        </div>
      </div>

      {/* Status badge */}
      <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
        data.deficitOrSurplus === 'surplus' ? 'bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30'
        : data.deficitOrSurplus === 'deficit' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30'
        : 'bg-violet-50 dark:bg-violet-950/20 border border-violet-100 dark:border-violet-900/30'
      }`}>
        <NetIcon className={`w-3.5 h-3.5 ${data.deficitOrSurplus === 'surplus' ? 'text-emerald-500' : data.deficitOrSurplus === 'deficit' ? 'text-amber-500' : 'text-violet-500'}`} />
        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {netLabel} · {data.todayWorkoutName ? `${data.todayWorkoutName} ≈ ${data.workoutBurn} kcal burned` : 'No workout today'}
        </span>
      </div>
    </div>
  );
}
