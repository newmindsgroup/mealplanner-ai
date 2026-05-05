/**
 * FamilyWorkoutComparison — Phase 12
 * Side-by-side comparison of workout stats across family members.
 * Enables friendly competition and ensures everyone stays on track.
 */
import React, { useState, useMemo } from 'react';
import { Users, Flame, Clock, Dumbbell, Award, TrendingUp, ArrowUpDown, Star, Zap, BarChart2 } from 'lucide-react';

interface FamilyMember {
  id: string;
  name: string;
  avatar?: string;
  color: string;
  stats: {
    workoutsThisWeek: number;
    totalMinutes: number;
    totalSets: number;
    streak: number;
    xp: number;
    consistency: number; // 0-100
  };
}

type SortKey = 'workouts' | 'minutes' | 'streak' | 'xp' | 'consistency';

const DEMO_MEMBERS: FamilyMember[] = [
  {
    id: '1', name: 'Marcus', color: 'from-orange-400 to-rose-500',
    stats: { workoutsThisWeek: 5, totalMinutes: 245, totalSets: 86, streak: 12, xp: 3450, consistency: 85 },
  },
  {
    id: '2', name: 'Sophia', color: 'from-violet-400 to-purple-500',
    stats: { workoutsThisWeek: 4, totalMinutes: 180, totalSets: 64, streak: 8, xp: 2800, consistency: 72 },
  },
  {
    id: '3', name: 'Jordan', color: 'from-blue-400 to-cyan-500',
    stats: { workoutsThisWeek: 3, totalMinutes: 135, totalSets: 48, streak: 5, xp: 1950, consistency: 60 },
  },
  {
    id: '4', name: 'Aria', color: 'from-emerald-400 to-teal-500',
    stats: { workoutsThisWeek: 6, totalMinutes: 310, totalSets: 102, streak: 21, xp: 4200, consistency: 92 },
  },
];

interface Props {
  members?: FamilyMember[];
}

export default function FamilyWorkoutComparison({ members }: Props) {
  const [sortBy, setSortBy] = useState<SortKey>('xp');
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const data = members && members.length > 0 ? members : DEMO_MEMBERS;
  const isDemo = !members || members.length === 0;

  const sorted = useMemo(() => {
    return [...data].sort((a, b) => {
      switch (sortBy) {
        case 'workouts': return b.stats.workoutsThisWeek - a.stats.workoutsThisWeek;
        case 'minutes': return b.stats.totalMinutes - a.stats.totalMinutes;
        case 'streak': return b.stats.streak - a.stats.streak;
        case 'xp': return b.stats.xp - a.stats.xp;
        case 'consistency': return b.stats.consistency - a.stats.consistency;
        default: return 0;
      }
    });
  }, [data, sortBy]);

  const maxXP = Math.max(...data.map(m => m.stats.xp));
  const selectedMember = data.find(m => m.id === selectedMemberId);

  const sortOptions: { key: SortKey; label: string; icon: React.ElementType }[] = [
    { key: 'xp', label: 'XP', icon: Star },
    { key: 'workouts', label: 'Workouts', icon: Dumbbell },
    { key: 'minutes', label: 'Time', icon: Clock },
    { key: 'streak', label: 'Streak', icon: Flame },
    { key: 'consistency', label: 'Consistency', icon: TrendingUp },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Family Comparison</h2>
            <p className="text-[11px] text-gray-400">
              {isDemo ? 'Demo data — connect family members to compare' : `${data.length} members this week`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <ArrowUpDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      {/* Sort pills */}
      <div className="flex gap-1 overflow-x-auto scrollbar-hide">
        {sortOptions.map(opt => {
          const Icon = opt.icon;
          return (
            <button
              key={opt.key}
              onClick={() => setSortBy(opt.key)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all ${
                sortBy === opt.key
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              <Icon className="w-3 h-3" />
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Rankings */}
      <div className="space-y-2">
        {sorted.map((member, index) => {
          const isSelected = selectedMemberId === member.id;
          const xpPercent = Math.round((member.stats.xp / maxXP) * 100);

          return (
            <div key={member.id}>
              <button
                onClick={() => setSelectedMemberId(isSelected ? null : member.id)}
                className={`w-full bg-white dark:bg-gray-800 rounded-2xl border transition-all ${
                  isSelected
                    ? 'border-blue-300 dark:border-blue-700 shadow-md ring-2 ring-blue-100 dark:ring-blue-900/30'
                    : 'border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
                } p-3`}
              >
                <div className="flex items-center gap-3">
                  {/* Rank */}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                    index === 0 ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white' :
                    index === 1 ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' :
                    index === 2 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-400'
                  }`}>
                    {index === 0 ? '👑' : `#${index + 1}`}
                  </div>

                  {/* Avatar + Name */}
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 bg-gradient-to-br ${member.color} rounded-full flex items-center justify-center text-white text-xs font-black`}>
                        {member.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-[10px] text-gray-400">{member.stats.streak} day streak 🔥</p>
                      </div>
                    </div>
                  </div>

                  {/* Primary stat based on sort */}
                  <div className="text-right">
                    <p className="text-lg font-black text-gray-900 dark:text-white">
                      {sortBy === 'xp' ? `${(member.stats.xp / 1000).toFixed(1)}k` :
                       sortBy === 'workouts' ? member.stats.workoutsThisWeek :
                       sortBy === 'minutes' ? `${member.stats.totalMinutes}m` :
                       sortBy === 'streak' ? member.stats.streak :
                       `${member.stats.consistency}%`}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      {sortBy === 'xp' ? 'XP' :
                       sortBy === 'workouts' ? 'sessions' :
                       sortBy === 'minutes' ? 'total' :
                       sortBy === 'streak' ? 'days' :
                       'consistency'}
                    </p>
                  </div>
                </div>

                {/* XP bar */}
                <div className="mt-2 bg-gray-100 dark:bg-gray-900 rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full bg-gradient-to-r ${member.color} transition-all duration-700`}
                    style={{ width: `${xpPercent}%` }}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              {isSelected && (
                <div className="mt-1 bg-gray-50 dark:bg-gray-900 rounded-xl p-3 grid grid-cols-4 gap-2 animate-in slide-in-from-top-2 duration-200">
                  <div className="text-center">
                    <Dumbbell className="w-4 h-4 text-orange-500 mx-auto" />
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{member.stats.workoutsThisWeek}</p>
                    <p className="text-[9px] text-gray-400">Workouts</p>
                  </div>
                  <div className="text-center">
                    <Clock className="w-4 h-4 text-violet-500 mx-auto" />
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{member.stats.totalMinutes}m</p>
                    <p className="text-[9px] text-gray-400">Duration</p>
                  </div>
                  <div className="text-center">
                    <BarChart2 className="w-4 h-4 text-blue-500 mx-auto" />
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{member.stats.totalSets}</p>
                    <p className="text-[9px] text-gray-400">Total Sets</p>
                  </div>
                  <div className="text-center">
                    <TrendingUp className="w-4 h-4 text-emerald-500 mx-auto" />
                    <p className="text-sm font-black text-gray-900 dark:text-white mt-1">{member.stats.consistency}%</p>
                    <p className="text-[9px] text-gray-400">Consistency</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Family total */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-4 text-white">
        <p className="text-xs text-white/70 font-medium">Family Total This Week</p>
        <div className="flex items-baseline gap-3 mt-1">
          <p className="text-2xl font-black">{data.reduce((s, m) => s + m.stats.totalMinutes, 0)}</p>
          <p className="text-sm text-white/70">minutes</p>
          <p className="text-2xl font-black ml-auto">{data.reduce((s, m) => s + m.stats.workoutsThisWeek, 0)}</p>
          <p className="text-sm text-white/70">sessions</p>
        </div>
        <div className="mt-3 flex gap-2">
          {data.map(m => (
            <div key={m.id} className="flex-1 bg-white/15 rounded-lg p-1.5 text-center">
              <p className="text-[10px] font-bold text-white/80">{m.name.charAt(0)}</p>
              <p className="text-xs font-black">{m.stats.workoutsThisWeek}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
