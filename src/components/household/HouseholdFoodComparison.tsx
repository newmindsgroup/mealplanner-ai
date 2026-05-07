/**
 * HouseholdFoodComparison — P0 Dashboard Component
 * Side-by-side blood type food compatibility for families.
 * Shows universal safe foods, conflicts, and shared meal suggestions.
 */
import React, { useState, useMemo } from 'react';
import {
  Users, Check, X, AlertTriangle, Utensils,
  ChevronDown, ChevronUp, Search, Filter,
  Heart, ShieldAlert, Sparkles
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import {
  generateHouseholdFoodReport,
  type HouseholdMember,
  type FoodComparison,
} from '../../services/householdFoodComparison';

type ViewMode = 'safe' | 'conflicts' | 'recommended';

const RATING_ICONS = {
  beneficial: { icon: '✅', color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
  neutral: { icon: '⚪', color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
  avoid: { icon: '❌', color: 'text-red-600 dark:text-red-400', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export default function HouseholdFoodComparison() {
  const { people } = useStore();
  const [viewMode, setViewMode] = useState<ViewMode>('safe');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  // Build household members from store
  const members: HouseholdMember[] = useMemo(() =>
    people
      .filter(p => p.bloodType)
      .map(p => ({ name: p.name, bloodType: p.bloodType })),
    [people]
  );

  const report = useMemo(() => {
    if (members.length < 2) return null;
    return generateHouseholdFoodReport(members);
  }, [members]);

  // If not enough members
  if (members.length < 2) {
    return (
      <div className="bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-950/20 dark:to-violet-950/20 rounded-2xl p-6 border border-indigo-200/50 dark:border-indigo-800/30">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-indigo-700 dark:text-indigo-400 text-sm">Add Family Members</h3>
            <p className="text-xs text-indigo-600 dark:text-indigo-300/70 mt-1 leading-relaxed">
              Set up at least 2 family members with blood types in your Household settings to see side-by-side food compatibility.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  // Filter by search
  const filterFoods = (foods: FoodComparison[]): FoodComparison[] => {
    if (!searchQuery) return foods;
    const q = searchQuery.toLowerCase();
    return foods.filter(f =>
      f.food.toLowerCase().includes(q) || f.category.toLowerCase().includes(q)
    );
  };

  const currentFoods = filterFoods(
    viewMode === 'safe' ? report.universalSafe
      : viewMode === 'conflicts' ? report.conflicts
      : report.recommended
  );

  // Group by category
  const grouped = currentFoods.reduce<Record<string, FoodComparison[]>>((acc, f) => {
    if (!acc[f.category]) acc[f.category] = [];
    acc[f.category].push(f);
    return acc;
  }, {});

  return (
    <div id="tour-household-food-comparison" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-indigo-400 to-violet-500 rounded-xl flex items-center justify-center">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-sm">Family Food Compatibility</h2>
            <p className="text-[11px] text-gray-400">
              {members.map(m => `${m.name} (${m.bloodType})`).join(' · ')}
            </p>
          </div>
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-2">
        <button
          onClick={() => setViewMode('safe')}
          className={`rounded-xl p-3 border text-center transition-all ${
            viewMode === 'safe'
              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 ring-2 ring-emerald-400/30'
              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-emerald-300'
          }`}
        >
          <Check className="w-4 h-4 text-emerald-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{report.stats.universalSafeCount}</p>
          <p className="text-[10px] text-gray-500 font-medium">Safe for All</p>
        </button>
        <button
          onClick={() => setViewMode('recommended')}
          className={`rounded-xl p-3 border text-center transition-all ${
            viewMode === 'recommended'
              ? 'bg-sky-50 dark:bg-sky-950/30 border-sky-300 dark:border-sky-800 ring-2 ring-sky-400/30'
              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-sky-300'
          }`}
        >
          <Heart className="w-4 h-4 text-sky-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{report.recommended.length}</p>
          <p className="text-[10px] text-gray-500 font-medium">Recommended</p>
        </button>
        <button
          onClick={() => setViewMode('conflicts')}
          className={`rounded-xl p-3 border text-center transition-all ${
            viewMode === 'conflicts'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-300 dark:border-red-800 ring-2 ring-red-400/30'
              : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:border-red-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4 text-red-500 mx-auto mb-1" />
          <p className="text-lg font-bold text-gray-900 dark:text-white">{report.stats.conflictCount}</p>
          <p className="text-[10px] text-gray-500 font-medium">Conflicts</p>
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search foods..."
          className="w-full pl-9 pr-3 py-2 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none"
        />
      </div>

      {/* Food list by category */}
      <div className="space-y-2">
        {Object.entries(grouped).map(([category, foods]) => {
          const isExpanded = expandedCategory === category || Object.keys(grouped).length <= 3;
          const displayFoods = isExpanded ? foods : foods.slice(0, 3);

          return (
            <div key={category} className="bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              {/* Category header */}
              <button
                onClick={() => setExpandedCategory(expandedCategory === category ? null : category)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-700 dark:text-gray-300 capitalize">{category}</span>
                  <span className="text-[10px] text-gray-400 font-medium">({foods.length})</span>
                </div>
                {foods.length > 3 && (
                  isExpanded
                    ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                    : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>

              {/* Foods table */}
              <div className="px-3.5 pb-3">
                {/* Header row with member names */}
                <div className="flex items-center gap-1 mb-1.5 px-1">
                  <span className="text-[10px] text-gray-400 font-medium flex-1">Food</span>
                  {members.map(m => (
                    <span key={m.name} className="text-[10px] text-gray-400 font-medium w-12 text-center truncate">
                      {m.name.split(' ')[0]}
                    </span>
                  ))}
                </div>

                {/* Food rows */}
                {displayFoods.map(food => (
                  <div
                    key={food.food}
                    className={`flex items-center gap-1 px-1 py-1.5 rounded-lg ${
                      food.householdSafe ? 'hover:bg-emerald-50/50 dark:hover:bg-emerald-950/10' : 'hover:bg-red-50/50 dark:hover:bg-red-950/10'
                    } transition-colors`}
                  >
                    <span className="text-xs text-gray-800 dark:text-gray-200 flex-1 font-medium">{food.food}</span>
                    {members.map(m => {
                      const rating = food.ratings[m.name];
                      const cfg = RATING_ICONS[rating] || RATING_ICONS.neutral;
                      return (
                        <span
                          key={m.name}
                          className={`w-12 text-center text-sm ${cfg.color}`}
                          title={`${food.food}: ${rating} for ${m.name}`}
                        >
                          {cfg.icon}
                        </span>
                      );
                    })}
                  </div>
                ))}

                {/* Show more */}
                {!isExpanded && foods.length > 3 && (
                  <button
                    onClick={() => setExpandedCategory(category)}
                    className="text-[11px] text-primary-500 font-semibold mt-1 hover:text-primary-600"
                  >
                    +{foods.length - 3} more...
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentFoods.length === 0 && searchQuery && (
        <div className="text-center py-6">
          <p className="text-sm text-gray-400">No foods match "{searchQuery}"</p>
        </div>
      )}
    </div>
  );
}
