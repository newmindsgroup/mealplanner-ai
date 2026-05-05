/**
 * Water Tracker — daily hydration logging with visual progress
 * Inspired by SparkyFitness's hydration module, implemented from scratch.
 * Data stored in our own DB (water_logs table — created dynamically if needed).
 */
import React, { useState, useEffect } from 'react';
import { Droplets, Plus, Minus, Check } from 'lucide-react';
import { api } from '../../services/apiClient';

const GOAL_ML = 2500;

const QUICK_AMOUNTS = [
  { label: '250ml', ml: 250, icon: '🥤' },
  { label: '500ml', ml: 500, icon: '🧃' },
  { label: '750ml', ml: 750, icon: '🍶' },
  { label: '1L', ml: 1000, icon: '🫙' },
];

interface WaterLog { id: string; amount_ml: number; logged_at: string; }

export default function WaterTracker() {
  const [logs, setLogs] = useState<WaterLog[]>([]);
  const [adding, setAdding] = useState(false);
  const [customMl, setCustomMl] = useState(250);

  const totalToday = logs.reduce((sum, l) => sum + l.amount_ml, 0);
  const pct = Math.min((totalToday / GOAL_ML) * 100, 100);

  useEffect(() => { loadToday(); }, []);

  const loadToday = async () => {
    try {
      const res = await api.get<{ success: boolean; data: WaterLog[] }>('/fitness/water/today');
      setLogs(res.data || []);
    } catch { /* non-fatal */ }
  };

  const logWater = async (ml: number) => {
    setAdding(true);
    try {
      await api.post('/fitness/water', { amount_ml: ml });
      await loadToday();
    } finally { setAdding(false); }
  };

  const undo = async (id: string) => {
    try {
      await api.delete(`/fitness/water/${id}`);
      await loadToday();
    } catch { /* non-fatal */ }
  };

  const color = pct >= 100 ? 'from-emerald-400 to-teal-500' : pct >= 60 ? 'from-blue-400 to-cyan-500' : 'from-blue-300 to-sky-400';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-blue-500" />
          <h3 className="font-bold text-gray-900 dark:text-white">Hydration</h3>
        </div>
        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pct >= 100 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
          {pct >= 100 ? '✅ Goal met!' : `${Math.round(pct)}%`}
        </span>
      </div>

      {/* Circular-ish progress */}
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 flex-shrink-0">
          <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="url(#water-grad)" strokeWidth="3"
              strokeDasharray={`${pct} ${100 - pct}`} strokeLinecap="round" />
            <defs>
              <linearGradient id="water-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#06b6d4" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-sm font-black text-gray-900 dark:text-white">{(totalToday / 1000).toFixed(1)}L</span>
            <span className="text-xs text-gray-400">/{GOAL_ML / 1000}L</span>
          </div>
        </div>
        <div className="flex-1">
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <div className={`h-full bg-gradient-to-r ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-gray-400 mt-1">{Math.max(0, GOAL_ML - totalToday)}ml remaining</p>
          {logs.length > 0 && (
            <div className="flex items-center gap-1 mt-1.5">
              {logs.slice(-5).map((l, i) => (
                <button key={l.id} onClick={() => undo(l.id)} title="Undo"
                  className="w-5 h-5 rounded-full bg-blue-100 text-blue-600 text-xs flex items-center justify-center hover:bg-red-100 hover:text-red-500 transition-colors">
                  💧
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="grid grid-cols-4 gap-1.5">
        {QUICK_AMOUNTS.map(({ label, ml, icon }) => (
          <button key={ml} onClick={() => logWater(ml)} disabled={adding}
            className="flex flex-col items-center py-2 px-1 rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors text-center disabled:opacity-50">
            <span className="text-base">{icon}</span>
            <span className="text-xs font-semibold text-blue-700 mt-0.5">{label}</span>
          </button>
        ))}
      </div>

      {/* Custom amount */}
      <div className="flex items-center gap-2">
        <button onClick={() => setCustomMl(m => Math.max(50, m - 50))}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Minus className="w-3 h-3 text-gray-500" />
        </button>
        <div className="flex-1 text-center text-sm font-semibold text-gray-700 dark:text-gray-300">{customMl}ml</div>
        <button onClick={() => setCustomMl(m => Math.min(2000, m + 50))}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
          <Plus className="w-3 h-3 text-gray-500" />
        </button>
        <button onClick={() => logWater(customMl)} disabled={adding}
          className="flex items-center gap-1 bg-blue-500 text-white font-semibold px-3 py-1.5 rounded-xl text-sm hover:bg-blue-600 transition-colors disabled:opacity-50">
          <Plus className="w-3.5 h-3.5" /> Add
        </button>
      </div>
    </div>
  );
}
