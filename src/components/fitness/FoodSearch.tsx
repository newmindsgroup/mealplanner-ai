/**
 * FoodSearch — Phase 10
 * Search USDA FoodData Central for detailed nutrition info.
 * Enables users to look up any food and see full macro + micro breakdown.
 */
import React, { useState, useRef, useCallback } from 'react';
import { Search, Loader2, X, ChevronDown, Apple, Flame, Droplet, Zap, Plus } from 'lucide-react';

interface FoodNutrient {
  nutrientName: string;
  value: number;
  unitName: string;
}

interface FoodItem {
  fdcId: number;
  description: string;
  brandName?: string;
  dataType: string;
  foodNutrients: FoodNutrient[];
  servingSize?: number;
  servingSizeUnit?: string;
}

const USDA_API_KEY = 'DEMO_KEY'; // Users can replace with their own key

const MACRO_KEYS = ['Energy', 'Protein', 'Total lipid (fat)', 'Carbohydrate, by difference', 'Fiber, total dietary', 'Sugars, total including NLEA'];
const MICRO_KEYS = ['Vitamin A, RAE', 'Vitamin C, total ascorbic acid', 'Vitamin D (D2 + D3)', 'Vitamin E (alpha-tocopherol)',
  'Calcium, Ca', 'Iron, Fe', 'Magnesium, Mg', 'Potassium, K', 'Sodium, Na', 'Zinc, Zn'];

const MACRO_DISPLAY: Record<string, { label: string; color: string; emoji: string }> = {
  'Energy': { label: 'Calories', color: 'text-orange-500', emoji: '🔥' },
  'Protein': { label: 'Protein', color: 'text-blue-500', emoji: '💪' },
  'Total lipid (fat)': { label: 'Fat', color: 'text-amber-500', emoji: '🧈' },
  'Carbohydrate, by difference': { label: 'Carbs', color: 'text-emerald-500', emoji: '🍞' },
  'Fiber, total dietary': { label: 'Fiber', color: 'text-green-600', emoji: '🥬' },
  'Sugars, total including NLEA': { label: 'Sugar', color: 'text-pink-500', emoji: '🍬' },
};

export default function FoodSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<FoodItem | null>(null);
  const [showMicros, setShowMicros] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const searchFood = useCallback(async (q: string) => {
    if (q.length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_API_KEY}&query=${encodeURIComponent(q)}&pageSize=15&dataType=Foundation,SR Legacy`);
      const data = await res.json();
      setResults(data.foods || []);
    } catch { setResults([]); }
    finally { setLoading(false); }
  }, []);

  const handleInput = (val: string) => {
    setQuery(val);
    setSelected(null);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchFood(val), 400);
  };

  const getNutrient = (food: FoodItem, name: string): FoodNutrient | undefined =>
    food.foodNutrients.find(n => n.nutrientName === name);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-green-500 rounded-xl flex items-center justify-center">
          <Apple className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">Food Lookup</h2>
          <p className="text-[11px] text-gray-400">USDA database · 400,000+ foods</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input type="text" value={query} onChange={e => handleInput(e.target.value)}
          placeholder="Search any food (e.g. chicken breast, avocado)…"
          className="w-full pl-10 pr-10 py-3 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-white" />
        {loading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500 animate-spin" />}
        {query && !loading && <button onClick={() => { setQuery(''); setResults([]); setSelected(null); }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          <X className="w-4 h-4" />
        </button>}
      </div>

      {/* Selected food detail */}
      {selected && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-black text-sm text-gray-900 dark:text-white capitalize">{selected.description.toLowerCase()}</h3>
              <p className="text-[10px] text-gray-400">Per 100g · USDA {selected.dataType}</p>
            </div>
            <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
          </div>

          {/* Macro cards */}
          <div className="grid grid-cols-3 gap-2">
            {MACRO_KEYS.map(key => {
              const n = getNutrient(selected, key);
              const cfg = MACRO_DISPLAY[key];
              if (!n || !cfg) return null;
              return (
                <div key={key} className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-2.5 text-center">
                  <span className="text-base">{cfg.emoji}</span>
                  <p className={`font-black text-sm ${cfg.color} mt-0.5`}>{Math.round(n.value * 10) / 10}<span className="text-[9px] opacity-60">{n.unitName === 'KCAL' ? '' : n.unitName.toLowerCase()}</span></p>
                  <p className="text-[9px] text-gray-400">{cfg.label}</p>
                </div>
              );
            })}
          </div>

          {/* Micronutrients (expandable) */}
          <button onClick={() => setShowMicros(s => !s)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-emerald-500 transition-colors">
            <ChevronDown className={`w-3 h-3 transition-transform ${showMicros ? 'rotate-180' : ''}`} />
            {showMicros ? 'Hide' : 'Show'} vitamins & minerals
          </button>

          {showMicros && (
            <div className="grid grid-cols-2 gap-1.5">
              {MICRO_KEYS.map(key => {
                const n = getNutrient(selected, key);
                if (!n) return null;
                const label = key.replace(/, .*/g, '').replace('total ascorbic acid', '');
                return (
                  <div key={key} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg px-2.5 py-1.5">
                    <span className="text-[10px] text-gray-500 truncate">{label}</span>
                    <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300">{Math.round(n.value * 10) / 10} {n.unitName.toLowerCase()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Results list */}
      {!selected && results.length > 0 && (
        <div className="space-y-1.5 max-h-[400px] overflow-y-auto">
          {results.map(food => {
            const cal = getNutrient(food, 'Energy');
            const prot = getNutrient(food, 'Protein');
            return (
              <button key={food.fdcId} onClick={() => setSelected(food)}
                className="w-full flex items-center gap-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 px-3 py-2.5 text-left hover:border-emerald-300 dark:hover:border-emerald-800 hover:shadow-sm transition-all">
                <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-950/30 rounded-lg flex items-center justify-center text-xs">🍎</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-gray-900 dark:text-white truncate capitalize">{food.description.toLowerCase()}</p>
                  <div className="flex gap-3 mt-0.5">
                    {cal && <span className="text-[10px] text-gray-400">{Math.round(cal.value)} kcal</span>}
                    {prot && <span className="text-[10px] text-gray-400">{Math.round(prot.value)}g protein</span>}
                  </div>
                </div>
                <span className="text-[9px] text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded">per 100g</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Empty state */}
      {!selected && results.length === 0 && query.length > 2 && !loading && (
        <div className="text-center py-8 text-gray-400">
          <Search className="w-6 h-6 mx-auto mb-2 opacity-30" />
          <p className="text-xs">No results found for "{query}"</p>
        </div>
      )}
    </div>
  );
}
