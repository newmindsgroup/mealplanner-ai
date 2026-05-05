/**
 * AI Recipe Generator UI — Phase 10
 * Generate recipes from AI based on macro targets, preferences, and goals.
 */
import React, { useState } from 'react';
import { ChefHat, Loader2, Sparkles, Clock, Flame, Zap, Users, Plus, X, RefreshCw, Copy, Check } from 'lucide-react';
import { api } from '../../services/apiClient';

interface NutritionInfo { calories: number; protein: number; carbs: number; fat: number; fiber?: number; sugar?: number; }
interface Ingredient { name: string; amount: string; notes?: string; }
interface Substitution { original: string; substitute: string; note: string; }
interface Recipe {
  name: string; description: string; prepTime: string; cookTime: string;
  servings: number; difficulty: string; tags: string[];
  ingredients: Ingredient[]; instructions: string[];
  nutrition: NutritionInfo; tips: string;
  substitutions: Substitution[]; mealPrepNotes: string;
}

const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack', 'pre-workout', 'post-workout'];
const CUISINES = ['any', 'Mediterranean', 'Asian', 'Mexican', 'Italian', 'Indian', 'American', 'Middle Eastern', 'Japanese', 'Korean', 'Thai'];
const TIMES = [
  { id: 'quick', label: '< 15 min', emoji: '⚡' },
  { id: 'moderate', label: '< 30 min', emoji: '🍳' },
  { id: 'elaborate', label: '< 60 min', emoji: '👨‍🍳' },
];
const DIETS = ['vegetarian', 'vegan', 'gluten-free', 'dairy-free', 'keto', 'paleo', 'low-carb', 'high-protein', 'nut-free'];

interface Props { personName?: string; bloodType?: string; fitnessGoal?: string; }

export default function AIRecipeGenerator({ personName, bloodType, fitnessGoal }: Props) {
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [form, setForm] = useState({
    mealType: 'dinner',
    targetCalories: 500,
    targetProtein: 35,
    targetCarbs: 50,
    targetFat: 18,
    dietaryPreferences: [] as string[],
    cuisinePreference: 'any',
    cookingTime: 'moderate',
    servings: 1,
  });

  const toggleDiet = (d: string) => {
    setForm(f => ({
      ...f,
      dietaryPreferences: f.dietaryPreferences.includes(d)
        ? f.dietaryPreferences.filter(x => x !== d)
        : [...f.dietaryPreferences, d],
    }));
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ success: boolean; data: Recipe }>('/fitness/ai-recipe', {
        ...form, personName, bloodType, fitnessGoal,
      });
      setRecipe(res.data);
    } catch { /* non-fatal */ }
    finally { setLoading(false); }
  };

  const copyRecipe = () => {
    if (!recipe) return;
    const text = `${recipe.name}\n\n${recipe.ingredients.map(i => `• ${i.amount} ${i.name}`).join('\n')}\n\n${recipe.instructions.map((s, i) => `${i + 1}. ${s}`).join('\n')}\n\nCalories: ${recipe.nutrition.calories} | P: ${recipe.nutrition.protein}g | C: ${recipe.nutrition.carbs}g | F: ${recipe.nutrition.fat}g`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-white" />
        </div>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white text-sm">AI Recipe Generator</h2>
          <p className="text-[11px] text-gray-400">Personalized meals that fit your macros</p>
        </div>
      </div>

      {!recipe ? (
        <>
          {/* Quick config */}
          <div className="space-y-3">
            {/* Meal type */}
            <div>
              <p className="text-xs font-bold text-gray-500 mb-1.5">Meal Type</p>
              <div className="flex flex-wrap gap-1.5">
                {MEAL_TYPES.map(m => (
                  <button key={m} onClick={() => setForm(f => ({ ...f, mealType: m }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${form.mealType === m ? 'bg-orange-500 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-orange-100'}`}>
                    {m.replace('-', ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { key: 'targetCalories', label: 'Calories', unit: 'kcal' },
                { key: 'targetProtein', label: 'Protein', unit: 'g' },
                { key: 'targetCarbs', label: 'Carbs', unit: 'g' },
                { key: 'targetFat', label: 'Fat', unit: 'g' },
              ].map(({ key, label, unit }) => (
                <div key={key}>
                  <p className="text-[10px] font-bold text-gray-400 mb-1">{label}</p>
                  <div className="relative">
                    <input type="number" value={(form as any)[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: Number(e.target.value) }))}
                      className="w-full text-sm font-bold border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-center focus:ring-2 focus:ring-orange-400 focus:outline-none bg-white dark:bg-gray-800" />
                    <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] text-gray-400">{unit}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Cooking time */}
            <div className="flex gap-2">
              {TIMES.map(t => (
                <button key={t.id} onClick={() => setForm(f => ({ ...f, cookingTime: t.id }))}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-2 rounded-xl border text-xs font-bold transition-all ${form.cookingTime === t.id ? 'border-orange-500 bg-orange-50 dark:bg-orange-950/20 text-orange-700' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>
                  <span className="text-base">{t.emoji}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>

            {/* Filters toggle */}
            <button onClick={() => setShowFilters(s => !s)}
              className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors">
              <Plus className="w-3 h-3" />
              {showFilters ? 'Hide' : 'Show'} dietary preferences & cuisine
            </button>

            {showFilters && (
              <div className="space-y-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-3">
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Dietary</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DIETS.map(d => (
                      <button key={d} onClick={() => toggleDiet(d)}
                        className={`px-2 py-1 rounded-lg text-[10px] font-bold capitalize transition-all ${form.dietaryPreferences.includes(d) ? 'bg-emerald-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        {d}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Cuisine</p>
                  <select value={form.cuisinePreference} onChange={e => setForm(f => ({ ...f, cuisinePreference: e.target.value }))}
                    className="w-full text-sm border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-orange-400 focus:outline-none">
                    {CUISINES.map(c => <option key={c} value={c}>{c === 'any' ? 'Any cuisine' : c}</option>)}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Generate button */}
          <button onClick={generate} disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black py-3.5 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-50 shadow-lg shadow-orange-200/40">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating…</> : <><Sparkles className="w-4 h-4" /> Generate Recipe</>}
          </button>
        </>
      ) : (
        /* Recipe result */
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{recipe.name}</h3>
              <p className="text-xs text-gray-400 mt-0.5">{recipe.description}</p>
            </div>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={copyRecipe} className={`p-2 rounded-xl border ${copied ? 'border-emerald-500 text-emerald-500' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:text-orange-500'} transition-all`}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
              <button onClick={() => setRecipe(null)} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-400 hover:text-orange-500 transition-all">
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-1.5">
            <span className="flex items-center gap-1 text-[10px] bg-amber-100 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 px-2 py-1 rounded-lg font-bold">
              <Clock className="w-3 h-3" /> {recipe.prepTime} prep · {recipe.cookTime} cook
            </span>
            <span className="flex items-center gap-1 text-[10px] bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-lg font-bold">
              <Users className="w-3 h-3" /> {recipe.servings} serving{recipe.servings > 1 ? 's' : ''}
            </span>
            <span className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-lg font-bold capitalize">{recipe.difficulty}</span>
            {recipe.tags?.map(t => (
              <span key={t} className="text-[10px] bg-gray-100 dark:bg-gray-700 text-gray-500 px-2 py-1 rounded-lg">{t}</span>
            ))}
          </div>

          {/* Macros */}
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Calories', value: recipe.nutrition.calories, unit: 'kcal', color: 'text-orange-500' },
              { label: 'Protein', value: recipe.nutrition.protein, unit: 'g', color: 'text-blue-500' },
              { label: 'Carbs', value: recipe.nutrition.carbs, unit: 'g', color: 'text-emerald-500' },
              { label: 'Fat', value: recipe.nutrition.fat, unit: 'g', color: 'text-amber-500' },
            ].map(({ label, value, unit, color }) => (
              <div key={label} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-2 text-center">
                <p className={`font-black text-base ${color}`}>{value}<span className="text-xs font-bold opacity-60">{unit}</span></p>
                <p className="text-[9px] text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Ingredients */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">🥘 Ingredients</p>
            <div className="space-y-1.5">
              {recipe.ingredients.map((ing, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 flex-shrink-0" />
                  <span className="font-bold text-gray-700 dark:text-gray-300">{ing.amount}</span>
                  <span className="text-gray-500">{ing.name}</span>
                  {ing.notes && <span className="text-gray-400 italic">({ing.notes})</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="font-bold text-sm text-gray-900 dark:text-white mb-2">📋 Instructions</p>
            <ol className="space-y-2">
              {recipe.instructions.map((step, i) => (
                <li key={i} className="flex gap-2.5 text-xs">
                  <span className="w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 text-[10px] font-black flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-gray-600 dark:text-gray-400 leading-relaxed">{step}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Tips & Substitutions */}
          {recipe.tips && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 rounded-xl p-3">
              <p className="text-xs font-bold text-amber-700 dark:text-amber-400">👨‍🍳 Chef Tip</p>
              <p className="text-xs text-amber-600/80 dark:text-amber-400/60 mt-0.5">{recipe.tips}</p>
            </div>
          )}

          {recipe.substitutions?.length > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30 rounded-xl p-3">
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1.5">🔄 Substitutions</p>
              {recipe.substitutions.map((s, i) => (
                <p key={i} className="text-xs text-blue-600/70 dark:text-blue-400/60">
                  <span className="font-semibold">{s.original}</span> → {s.substitute} <span className="italic">({s.note})</span>
                </p>
              ))}
            </div>
          )}

          {recipe.mealPrepNotes && (
            <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3">
              <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">📦 Meal Prep</p>
              <p className="text-xs text-emerald-600/80 dark:text-emerald-400/60 mt-0.5">{recipe.mealPrepNotes}</p>
            </div>
          )}

          <button onClick={() => { setRecipe(null); generate(); }}
            className="w-full flex items-center justify-center gap-2 border border-orange-300 dark:border-orange-900/40 text-orange-600 font-bold py-2.5 rounded-xl text-sm hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-all">
            <Sparkles className="w-4 h-4" /> Generate Another
          </button>
        </div>
      )}
    </div>
  );
}
