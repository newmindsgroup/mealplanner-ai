/**
 * RecipeDiscovery — Full-featured recipe browser with filters.
 * Shows all 101+ recipes with blood type, category, tag, and text search.
 * Includes recipe detail modal with ingredients, instructions, and health benefits.
 */
import React, { useState, useMemo, useCallback } from 'react';
import {
  Search, Filter, ChefHat, Heart, Clock, Users as UsersIcon,
  Sparkles, X, ChevronDown, ChevronUp, Apple, Droplets,
  Leaf, Dumbbell, Baby, Globe, Brain, Flame, Pill,
  BookOpen, Check, Star, ExternalLink
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import { RECIPES, getRecipeCount, type RecipeResult } from '../../data/recipeDatabase';

// ─── Filter categories ──────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'all', label: 'All', icon: ChefHat },
  { id: 'meal', label: 'Meals', icon: ChefHat },
  { id: 'smoothie', label: 'Smoothies', icon: Droplets },
  { id: 'juice', label: 'Juices', icon: Apple },
  { id: 'snack', label: 'Snacks', icon: Leaf },
];

const TAG_GROUPS = [
  {
    label: 'Blood Type',
    tags: ['blood-type-o', 'blood-type-a', 'blood-type-b', 'blood-type-ab', 'universal'],
    colors: ['bg-red-100 text-red-700', 'bg-blue-100 text-blue-700', 'bg-green-100 text-green-700', 'bg-purple-100 text-purple-700', 'bg-gray-100 text-gray-700'],
  },
  {
    label: 'Health Focus',
    tags: ['anti-inflammatory', 'gut-health', 'brain-food', 'hormone-support', 'blood-sugar', 'immune-support', 'autoimmune'],
    colors: Array(7).fill('bg-amber-100 text-amber-700'),
  },
  {
    label: 'Lifestyle',
    tags: ['quick', '5-minute', 'meal-prep', 'vegetarian', 'vegan', 'high-protein', 'no-cook'],
    colors: Array(7).fill('bg-sky-100 text-sky-700'),
  },
  {
    label: 'Cuisine',
    tags: ['mediterranean', 'asian', 'latin'],
    colors: Array(3).fill('bg-emerald-100 text-emerald-700'),
  },
];

const PREP_TIME_FILTERS = [
  { label: 'Any', max: Infinity },
  { label: '≤ 10 min', max: 10 },
  { label: '≤ 20 min', max: 20 },
  { label: '≤ 30 min', max: 30 },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function parsePrepMinutes(prep: string): number {
  const match = prep.match(/(\d+)/);
  return match ? parseInt(match[1]) : 999;
}

// ─── Recipe Card ────────────────────────────────────────────────────────────

function RecipeCard({ recipe, isCompatible, onClick }: {
  recipe: RecipeResult;
  isCompatible: boolean;
  onClick: () => void;
}) {
  const categoryIcons: Record<string, typeof ChefHat> = {
    meal: ChefHat, smoothie: Droplets, juice: Apple, snack: Leaf,
  };
  const Icon = categoryIcons[recipe.category] || ChefHat;

  const categoryColors: Record<string, string> = {
    meal: 'from-orange-400 to-rose-500',
    smoothie: 'from-violet-400 to-purple-500',
    juice: 'from-lime-400 to-emerald-500',
    snack: 'from-amber-400 to-orange-500',
  };

  return (
    <button
      onClick={onClick}
      className="group text-left bg-white dark:bg-gray-800/60 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-200 hover:-translate-y-0.5"
    >
      {/* Color header bar */}
      <div className={`h-1.5 bg-gradient-to-r ${categoryColors[recipe.category] || 'from-gray-400 to-gray-500'}`} />

      <div className="p-4">
        {/* Top row: icon + category */}
        <div className="flex items-center justify-between mb-2">
          <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${categoryColors[recipe.category] || 'from-gray-400 to-gray-500'} flex items-center justify-center`}>
            <Icon className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-center gap-1.5">
            {isCompatible && (
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                ✓ Your Type
              </span>
            )}
            <span className="text-[9px] font-bold text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full uppercase">
              {recipe.category}
            </span>
          </div>
        </div>

        {/* Name */}
        <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-snug group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 mb-1.5">
          {recipe.name}
        </h3>

        {/* Health benefits preview */}
        <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-3">
          {recipe.healthBenefits[0]}
        </p>

        {/* Bottom row: prep time + servings + nutrition */}
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" /> {recipe.prepTime}
          </span>
          <span className="flex items-center gap-1">
            <UsersIcon className="w-3 h-3" /> {recipe.servings}
          </span>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {recipe.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-[9px] text-gray-400 bg-gray-50 dark:bg-gray-800 px-1.5 py-0.5 rounded-full">
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
          {recipe.tags.length > 3 && (
            <span className="text-[9px] text-gray-300">+{recipe.tags.length - 3}</span>
          )}
        </div>
      </div>
    </button>
  );
}

// ─── Recipe Detail Modal ────────────────────────────────────────────────────

function RecipeDetailModal({ recipe, onClose, isCompatible, bloodType }: {
  recipe: RecipeResult;
  onClose: () => void;
  isCompatible: boolean;
  bloodType: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4 flex items-start justify-between z-10">
          <div className="flex-1 min-w-0 pr-3">
            <h2 className="text-lg font-black text-gray-900 dark:text-white leading-tight">{recipe.name}</h2>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.prepTime}</span>
              <span className="text-xs text-gray-400 flex items-center gap-1"><UsersIcon className="w-3 h-3" /> {recipe.servings} servings</span>
              {isCompatible && (
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 rounded-full">
                  ✓ Compatible with Type {bloodType.replace(/[+-]/, '')}
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          {/* Nutrition highlight */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 rounded-xl p-3 border border-emerald-200/50 dark:border-emerald-800/30">
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">📊 Nutrition</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-300/80">{recipe.nutritionHighlights}</p>
          </div>

          {/* Ingredients */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-orange-500" /> Ingredients
            </h3>
            <ul className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                  <Check className="w-3 h-3 text-primary-400 mt-0.5 flex-shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-500" /> Instructions
            </h3>
            <ol className="space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-gray-600 dark:text-gray-400">
                  <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Health Benefits */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Heart className="w-4 h-4 text-rose-500" /> Health Benefits
            </h3>
            <div className="space-y-1.5">
              {recipe.healthBenefits.map((benefit, i) => (
                <p key={i} className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                  • {benefit}
                </p>
              ))}
            </div>
          </div>

          {/* Blood type compatibility */}
          {recipe.bloodTypes.length > 0 && (
            <div className="bg-violet-50 dark:bg-violet-950/20 rounded-xl p-3 border border-violet-200/50 dark:border-violet-800/30">
              <p className="text-xs font-bold text-violet-700 dark:text-violet-400 mb-1">🩸 Blood Type Compatibility</p>
              <div className="flex flex-wrap gap-1.5">
                {recipe.bloodTypes.map(bt => (
                  <span key={bt} className="text-[10px] font-bold bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                    Type {bt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            {recipe.tags.map(tag => (
              <span key={tag} className="text-[10px] text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                {tag.replace(/-/g, ' ')}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function RecipeDiscovery() {
  const { people } = useStore();
  const bloodType = people[0]?.bloodType || '';
  const bt = bloodType.replace(/[+-]/, '').toUpperCase();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [prepTimeMax, setPrepTimeMax] = useState(Infinity);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeResult | null>(null);
  const [compatibleOnly, setCompatibleOnly] = useState(false);

  const counts = useMemo(() => getRecipeCount(), []);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag); else next.add(tag);
      return next;
    });
  };

  const isCompatible = useCallback((recipe: RecipeResult) => {
    if (!bt) return true;
    return recipe.bloodTypes.length === 0 || recipe.bloodTypes.some(b => b.startsWith(bt));
  }, [bt]);

  const filteredRecipes = useMemo(() => {
    let results = [...RECIPES];

    // Category
    if (selectedCategory !== 'all') {
      results = results.filter(r => r.category === selectedCategory);
    }

    // Blood type compatible only
    if (compatibleOnly && bt) {
      results = results.filter(r => isCompatible(r));
    }

    // Tags
    if (selectedTags.size > 0) {
      results = results.filter(r =>
        [...selectedTags].every(tag => r.tags.includes(tag))
      );
    }

    // Prep time
    if (prepTimeMax < Infinity) {
      results = results.filter(r => parsePrepMinutes(r.prepTime) <= prepTimeMax);
    }

    // Text search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const terms = q.split(/\s+/).filter(t => t.length > 1);
      results = results
        .map(r => {
          let score = 0;
          for (const t of terms) {
            if (r.name.toLowerCase().includes(t)) score += 10;
            if (r.tags.some(tag => tag.includes(t))) score += 6;
            if (r.ingredients.some(ing => ing.toLowerCase().includes(t))) score += 3;
            if (r.healthBenefits.some(b => b.toLowerCase().includes(t))) score += 4;
          }
          return { r, score };
        })
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .map(x => x.r);
    }

    return results;
  }, [searchQuery, selectedCategory, selectedTags, prepTimeMax, compatibleOnly, bt, isCompatible]);

  const activeFilterCount = (selectedCategory !== 'all' ? 1 : 0) + selectedTags.size + (prepTimeMax < Infinity ? 1 : 0) + (compatibleOnly ? 1 : 0);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Recipe Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {counts.total} recipes · {Object.keys(counts.byCategory).length} categories
            {bt && ` · Showing compatibility for Type ${bt}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
              showFilters || activeFilterCount > 0
                ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            Filters
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary-500 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search by name, ingredient, health concern..."
          className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-primary-400 outline-none transition-all"
        />
        {searchQuery && (
          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
            <X className="w-4 h-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {CATEGORIES.map(cat => {
          const Icon = cat.icon;
          const isActive = selectedCategory === cat.id;
          const count = cat.id === 'all' ? counts.total : (counts.byCategory[cat.id] || 0);
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-primary-500 text-white shadow-md shadow-primary-500/25'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.label}
              <span className={`text-[10px] ${isActive ? 'text-white/70' : 'text-gray-400'}`}>({count})</span>
            </button>
          );
        })}
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700 p-4 space-y-4 animate-fade-in">
          {/* Blood type toggle */}
          {bt && (
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Only show Type {bt} compatible</span>
              <button
                onClick={() => setCompatibleOnly(!compatibleOnly)}
                className={`w-10 h-5.5 rounded-full transition-colors relative ${compatibleOnly ? 'bg-primary-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${compatibleOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </button>
            </div>
          )}

          {/* Prep time */}
          <div>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Prep Time</p>
            <div className="flex gap-2">
              {PREP_TIME_FILTERS.map(f => (
                <button
                  key={f.label}
                  onClick={() => setPrepTimeMax(f.max)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    prepTimeMax === f.max
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tag groups */}
          {TAG_GROUPS.map(group => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">{group.label}</p>
              <div className="flex flex-wrap gap-1.5">
                {group.tags.map((tag, i) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all ${
                      selectedTags.has(tag)
                        ? 'bg-primary-500 text-white shadow-sm'
                        : `${group.colors[i] || 'bg-gray-100 text-gray-600'} dark:bg-gray-700 dark:text-gray-300 hover:opacity-80`
                    }`}
                  >
                    {tag.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          ))}

          {/* Clear all */}
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSelectedTags(new Set());
                setPrepTimeMax(Infinity);
                setCompatibleOnly(false);
              }}
              className="text-xs font-semibold text-red-500 hover:text-red-600"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-gray-400 font-medium">
        {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''} found
        {activeFilterCount > 0 && ` (${activeFilterCount} filter${activeFilterCount > 1 ? 's' : ''} active)`}
      </p>

      {/* Recipe grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredRecipes.map(recipe => (
          <RecipeCard
            key={recipe.name}
            recipe={recipe}
            isCompatible={isCompatible(recipe)}
            onClick={() => setSelectedRecipe(recipe)}
          />
        ))}
      </div>

      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <ChefHat className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-3" />
          <h3 className="font-bold text-gray-500 mb-1">No recipes found</h3>
          <p className="text-sm text-gray-400">Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Recipe detail modal */}
      {selectedRecipe && (
        <RecipeDetailModal
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          isCompatible={isCompatible(selectedRecipe)}
          bloodType={bloodType}
        />
      )}
    </div>
  );
}
