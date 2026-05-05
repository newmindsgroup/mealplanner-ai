/**
 * FamilyLeaderboard — Gamified per-member fitness ranking card
 * Phase 6 feature.
 */
import React, { useState, useEffect } from 'react';
import { Trophy, Flame, Zap, Crown, Medal, Award, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../../services/apiClient';

interface LeaderboardEntry {
  personId: string;
  name: string;
  age: number | null;
  goal: string | null;
  fitnessLevel: string | null;
  daysPerWeek: number;
  totalSessions: number;
  weekSessions: number;
  prCount: number;
  xp: number;
  streak: number;
  hasProfile: boolean;
}

function avatarColor(id: string): string {
  const COLORS = ['from-orange-400 to-rose-500','from-blue-400 to-indigo-500','from-emerald-400 to-teal-500','from-violet-400 to-purple-500','from-amber-400 to-orange-500','from-pink-400 to-rose-500','from-cyan-400 to-blue-500','from-lime-400 to-green-500'];
  let hash = 0;
  for (const ch of id) hash = (hash * 31 + ch.charCodeAt(0)) & 0xffff;
  return COLORS[hash % COLORS.length];
}

function initials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

const RANK_ICONS = [
  <Crown key="1" className="w-4 h-4 text-yellow-500" />,
  <Medal key="2" className="w-4 h-4 text-slate-400" />,
  <Award key="3" className="w-4 h-4 text-amber-600" />,
];

const GOAL_LABELS: Record<string, string> = {
  weight_loss: 'Weight Loss', muscle_gain: 'Muscle Gain',
  endurance: 'Endurance', flexibility: 'Flexibility', general_health: 'General Health',
};

export default function FamilyLeaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    try {
      const res = await api.get<{ success: boolean; data: LeaderboardEntry[] }>('/fitness/leaderboard');
      setEntries(res.data || []);
    } catch { /* non-fatal */ }
    finally { setLoading(false); setRefreshing(false); }
  };

  const maxXp = Math.max(...entries.map(e => e.xp), 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-40 gap-2 text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading leaderboard…</span>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <Trophy className="w-10 h-10 mx-auto mb-2 opacity-30" />
        <p className="text-sm font-semibold">No family members yet</p>
        <p className="text-xs mt-1">Add people to see the leaderboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center">
            <Trophy className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Family Leaderboard</h3>
            <p className="text-[11px] text-gray-400">This week · All time XP</p>
          </div>
        </div>
        <button onClick={() => load(true)} disabled={refreshing} className="p-1.5 text-gray-400 hover:text-orange-500 transition-colors rounded-lg hover:bg-orange-50 dark:hover:bg-orange-950/20">
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 bg-gradient-to-r from-orange-50 to-rose-50 dark:from-gray-800 dark:to-gray-800 rounded-xl p-3 border border-orange-100 dark:border-gray-700">
        {[
          { label: 'Members', value: entries.length, icon: Trophy },
          { label: 'Sessions/Wk', value: entries.reduce((s, e) => s + e.weekSessions, 0), icon: Flame },
          { label: 'Total XP', value: entries.reduce((s, e) => s + e.xp, 0).toLocaleString(), icon: Zap },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="text-center">
            <Icon className="w-3.5 h-3.5 text-orange-500 mx-auto mb-0.5" />
            <div className="text-base font-black text-gray-900 dark:text-white">{value}</div>
            <div className="text-[10px] text-gray-400">{label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {entries.map((entry, idx) => (
          <div key={entry.personId} className={`rounded-2xl border p-4 transition-all ${idx === 0 ? 'border-yellow-200 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20 shadow-sm' : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'}`}>
            <div className="flex items-center gap-3">
              <div className="w-6 flex items-center justify-center flex-shrink-0">
                {idx < 3 ? RANK_ICONS[idx] : <span className="text-xs font-black text-gray-300">#{idx + 1}</span>}
              </div>
              <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor(entry.personId)} flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-sm`}>
                {initials(entry.name)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-bold text-gray-900 dark:text-white text-sm truncate">{entry.name}</span>
                  {!entry.hasProfile && <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-400 px-1.5 py-0.5 rounded">No profile</span>}
                </div>
                {entry.goal && <p className="text-[11px] text-gray-400 truncate mb-1">{GOAL_LABELS[entry.goal] || entry.goal}</p>}
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-orange-400 to-rose-500 rounded-full transition-all duration-700" style={{ width: `${maxXp > 0 ? Math.min(100, Math.round((entry.xp / maxXp) * 100)) : 0}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {entry.streak > 0 && (
                  <div className="flex items-center gap-0.5 text-orange-500">
                    <Flame className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">{entry.streak}</span>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-sm font-black text-violet-600">{entry.xp}</div>
                  <div className="text-[10px] text-gray-400">XP</div>
                </div>
                <div className="text-center hidden sm:block">
                  <div className="text-sm font-black text-gray-900 dark:text-white">{entry.weekSessions}</div>
                  <div className="text-[10px] text-gray-400">this wk</div>
                </div>
              </div>
            </div>
            {idx === 0 && entry.hasProfile && (
              <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-yellow-100 dark:border-yellow-900/30">
                {[`🏆 ${entry.totalSessions} sessions`, `💪 ${entry.prCount} PRs`, `📅 ${entry.daysPerWeek}x/week`, entry.fitnessLevel].filter(Boolean).map(tag => (
                  <span key={tag!} className="text-[11px] bg-white dark:bg-gray-700 border border-yellow-200 dark:border-yellow-900/30 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full capitalize">{tag}</span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
