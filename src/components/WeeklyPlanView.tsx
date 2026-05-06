import { useState, useMemo, useEffect } from 'react';
import { Search, Heart, Download, Printer, Calendar as CalendarIcon, Clock, Volume2, Sparkles, Filter, TrendingUp, Award, Flame, ChevronDown, ChevronUp } from 'lucide-react';
import { useStore } from '../store/useStore';
import { format, startOfWeek, addDays } from 'date-fns';
import MealCard from './MealCard';
import { generateWeeklyPlan } from '../services/mealPlanning';
import VoiceReaderButton from './VoiceReaderButton';
import LoadingSpinner from './LoadingSpinner';
import { WeeklyPlanSkeleton } from './SkeletonLoader';
import { FoodBenefitIcon } from './food-guide/FoodBenefitBadge';
import WorkoutDayCard from './fitness/WorkoutDayCard';
import SwarmAnalysisPanel from './shared/SwarmAnalysisPanel';
import { checkSwarmHealth, type SwarmHealthStatus } from '../services/swarmService';
import type { HealthBenefit } from '../types';

export default function WeeklyPlanView({ onNavigateToFitness }: { onNavigateToFitness?: () => void } = {}) {
  const { currentPlan, setCurrentPlan, people, addPlan, toggleFavorite, favoriteMeals } = useStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCuisine, setFilterCuisine] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [swarmHealth, setSwarmHealth] = useState<SwarmHealthStatus | null>(null);
  const [showSwarmPanels, setShowSwarmPanels] = useState(false);

  useEffect(() => {
    checkSwarmHealth().then(setSwarmHealth).catch(() => {});
  }, []);

  const weekStart = currentPlan
    ? new Date(currentPlan.weekStart)
    : new Date(); // Always start from today

  const handleGeneratePlan = async () => {
    if (people.length === 0) {
      alert('Please add at least one person in Profile Setup first.');
      return;
    }

    setIsGenerating(true);
    try {
      const plan = await generateWeeklyPlan(people);
      addPlan(plan);
    } catch (error) {
      console.error('Error generating plan:', error);
      alert('Failed to generate meal plan. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Calculate weekly statistics
  const weeklyStats = useMemo(() => {
    if (!currentPlan) return null;

    const allMeals = currentPlan.days.flatMap(day => [
      day.breakfast,
      day.lunch,
      day.dinner,
      day.snack
    ]);

    const totalCalories = allMeals.reduce((sum, meal) => 
      sum + (meal.nutritionalInfo?.calories || 0), 0
    );

    const healthBenefits = new Set<HealthBenefit>();
    allMeals.forEach(meal => {
      if (meal.healthBenefits) {
        meal.healthBenefits.forEach(benefit => healthBenefits.add(benefit));
      }
    });

    const totalMeals = allMeals.length;
    const avgCaloriesPerDay = Math.round(totalCalories / 7);

    return {
      totalMeals,
      totalCalories,
      avgCaloriesPerDay,
      healthBenefits: Array.from(healthBenefits),
    };
  }, [currentPlan]);

  const bloodTypes = useMemo(() => {
    return [...new Set(people.map(p => p.bloodType))];
  }, [people]);

  if (!currentPlan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
        <div className="text-center max-w-md">
          <div className="relative mb-6">
            <div className="absolute inset-0 bg-primary-400/20 blur-3xl rounded-full"></div>
            <CalendarIcon className="w-20 h-20 text-primary-500 dark:text-primary-400 relative z-10 mx-auto" />
          </div>
          <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            No Weekly Plan Yet
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
            Generate your first weekly meal plan to get started! The AI will create personalized meals based on your family's blood types and preferences.
          </p>
          <button
            onClick={handleGeneratePlan}
            disabled={isGenerating || people.length === 0}
            className="btn btn-primary text-base px-8 py-4 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generating Plan...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <span>Generate Weekly Plan</span>
              </>
            )}
          </button>
          {people.length === 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-6 flex items-center justify-center gap-2">
              <span>💡</span>
              <span>Add family members in Profile Setup first</span>
            </p>
          )}
        </div>
      </div>
    );
  }

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const filteredDays = currentPlan.days.filter((day) => {
    const matchesSearch = searchQuery === '' || 
      day.breakfast.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      day.lunch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      day.dinner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      day.snack.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCuisine = filterCuisine === '' || 
      day.breakfast.cuisine === filterCuisine ||
      day.lunch.cuisine === filterCuisine ||
      day.dinner.cuisine === filterCuisine ||
      day.snack.cuisine === filterCuisine;
    
    return matchesSearch && matchesCuisine;
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Modern Header */}
      <div className="card-elevated p-4 md:p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
                Weekly Meal Plan
              </h1>
              {currentPlan && (
                <div className="hidden sm:block flex-shrink-0">
                  <VoiceReaderButton
                    text={`Weekly meal plan from ${format(weekStart, 'MMMM d')} to ${format(addDays(weekStart, 6), 'MMMM d')}. ${currentPlan.days.map(day => `${format(new Date(day.date), 'EEEE')}: ${day.breakfast.name} for breakfast, ${day.lunch.name} for lunch, ${day.dinner.name} for dinner, and ${day.snack.name} for snack`).join('. ')}`}
                  />
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium truncate">
                  <span className="hidden sm:inline">{format(weekStart, 'MMMM d')} - {format(addDays(weekStart, 6), 'MMMM d, yyyy')}</span>
                  <span className="sm:hidden">{format(weekStart, 'MMM d')} - {format(addDays(weekStart, 6), 'MMM d')}</span>
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {people.length > 0 && (
                  <span className="text-xs sm:text-sm whitespace-nowrap">👥 {people.length} {people.length === 1 ? 'person' : 'people'}</span>
                )}
                {bloodTypes.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap">
                    {bloodTypes.map(bt => (
                      <span key={bt} className="text-[11px] px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded font-medium whitespace-nowrap">
                        {bt}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => window.print()}
              className="btn btn-secondary flex items-center gap-2 min-w-[44px] min-h-[44px]"
              aria-label="Print meal plan"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
            <button
              onClick={handleGeneratePlan}
              disabled={isGenerating}
              className="btn btn-primary flex items-center gap-2 flex-1 sm:flex-initial min-h-[44px]"
              aria-label="Regenerate meal plan"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Regenerate</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Weekly Summary Panel */}
      {weeklyStats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          <div className="card p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 border-2 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-blue-500 dark:bg-blue-600 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {weeklyStats.totalMeals}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Total Meals</div>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border-2 border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-orange-500 dark:bg-orange-600 rounded-lg flex-shrink-0">
                <Flame className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="min-w-0">
                <div className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                  {weeklyStats.avgCaloriesPerDay}
                </div>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 truncate">Avg Cal/Day</div>
              </div>
            </div>
          </div>

          <div className="card p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-2 border-green-200 dark:border-green-800 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="p-2.5 sm:p-3 bg-green-500 dark:bg-green-600 rounded-lg flex-shrink-0">
                <Award className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-1">Health Benefits</div>
                <div className="flex flex-wrap gap-1">
                  {weeklyStats.healthBenefits.slice(0, 4).map(benefit => (
                    <FoodBenefitIcon key={benefit} benefit={benefit} size="sm" />
                  ))}
                  {weeklyStats.healthBenefits.length > 4 && (
                    <span className="text-[11px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded">
                      +{weeklyStats.healthBenefits.length - 4}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NourishAI Meal Intelligence */}
      {swarmHealth?.status === 'healthy' && currentPlan && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden shadow-sm">
          <button
            onClick={() => setShowSwarmPanels(!showSwarmPanels)}
            className="w-full flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900 dark:text-white">NourishAI Meal Intelligence</h3>
                <p className="text-xs text-gray-500">USDA-verified nutrition, blood type optimization, exportable PDF</p>
              </div>
            </div>
            {showSwarmPanels ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
          </button>
          {showSwarmPanels && (
            <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
              <SwarmAnalysisPanel
                taskType="meal_plan_verified"
                context={{
                  people: people.map(p => ({
                    name: p.name,
                    bloodType: p.bloodType,
                    age: p.age,
                    allergies: p.allergies,
                    dietaryCodes: p.dietaryCodes,
                    goals: p.goals,
                  })),
                  currentPlan: {
                    weekStart: currentPlan.weekStart,
                    totalMeals: weeklyStats?.totalMeals,
                    avgCaloriesPerDay: weeklyStats?.avgCaloriesPerDay,
                    days: currentPlan.days.map(d => ({
                      date: d.date,
                      breakfast: { name: d.breakfast.name, calories: d.breakfast.nutritionalInfo?.calories },
                      lunch: { name: d.lunch.name, calories: d.lunch.nutritionalInfo?.calories },
                      dinner: { name: d.dinner.name, calories: d.dinner.nutritionalInfo?.calories },
                      snack: { name: d.snack.name, calories: d.snack.nutritionalInfo?.calories },
                    })),
                  },
                  bloodTypes: [...new Set(people.map(p => p.bloodType))],
                }}
                title="USDA Nutrition Verification"
                description="Cross-reference every meal against USDA FoodData Central for accurate macro/micronutrient content."
                buttonLabel="Verify Nutrition Data"
                accentColor="green"
                gradientClasses="from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20"
              />

              <SwarmAnalysisPanel
                taskType="meal_plan_pdf"
                context={{
                  people: people.map(p => ({ name: p.name, bloodType: p.bloodType })),
                  currentPlan: {
                    weekStart: currentPlan.weekStart,
                    days: currentPlan.days.map(d => ({
                      date: d.date,
                      breakfast: { name: d.breakfast.name, ingredients: d.breakfast.ingredients },
                      lunch: { name: d.lunch.name, ingredients: d.lunch.ingredients },
                      dinner: { name: d.dinner.name, ingredients: d.dinner.ingredients },
                      snack: { name: d.snack.name, ingredients: d.snack.ingredients },
                    })),
                  },
                }}
                title="Export Meal Plan PDF"
                description="Print-ready PDF with daily meals, recipes, nutrition breakdown, and grocery shopping list."
                buttonLabel="Generate PDF"
                accentColor="blue"
                gradientClasses="from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20"
              />
            </div>
          )}
        </div>
      )}

      {/* Modern Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search meals, ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-12 pr-4"
          />
        </div>
        <div className="relative sm:w-48">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            value={filterCuisine}
            onChange={(e) => setFilterCuisine(e.target.value)}
            className="input pl-12 pr-4 appearance-none cursor-pointer"
          >
            <option value="">All Cuisines</option>
            <option value="latin">Latin</option>
            <option value="mediterranean">Mediterranean</option>
            <option value="asian">Asian</option>
            <option value="american">American</option>
            <option value="european">European</option>
            <option value="middle-eastern">Middle Eastern</option>
          </select>
        </div>
      </div>

      {/* Weekly Plan - Enhanced Day Sections with Better Visual Separation */}
      <div className="space-y-8">
        {days.map((day, dayIndex) => {
          const dayPlan = currentPlan.days.find(d => format(new Date(d.date), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd'));
          if (!dayPlan) return null;

          const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
          
          // Filter meals based on search and cuisine
          const meals = (['breakfast', 'lunch', 'dinner', 'snack'] as const)
            .map(mealType => ({
              type: mealType,
              meal: dayPlan[mealType],
            }))
            .filter(({ meal }) => {
              const matchesSearch = searchQuery === '' || 
                meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                meal.ingredients.some(ing => ing.toLowerCase().includes(searchQuery.toLowerCase()));
              const matchesCuisine = filterCuisine === '' || meal.cuisine === filterCuisine;
              return matchesSearch && matchesCuisine;
            });

          if (meals.length === 0) return null;

          // Calculate day stats
          const dayCalories = meals.reduce((sum, { meal }) => 
            sum + (meal.nutritionalInfo?.calories || 0), 0
          );
          const dayHealthBenefits = new Set<HealthBenefit>();
          meals.forEach(({ meal }) => {
            if (meal.healthBenefits) {
              meal.healthBenefits.forEach(benefit => dayHealthBenefits.add(benefit));
            }
          });
          
          return (
            <div
              key={dayIndex}
              className={`card-elevated p-4 md:p-6 animate-fade-in transition-all duration-300 hover:shadow-xl ${
                isToday ? 'ring-2 ring-primary-500 dark:ring-primary-500 bg-gradient-to-br from-primary-50/50 to-white dark:from-primary-950/20 dark:to-gray-900' : ''
              }`}
              style={{ 
                animationDelay: `${dayIndex * 0.05}s`,
                ...(isToday ? { boxShadow: '0 0 40px rgba(34, 197, 94, 0.2)' } : {})
              }}
            >
              {/* Enhanced Day Header */}
              <div className="mb-4 md:mb-6 pb-3 md:pb-4 border-b-2 border-gray-200 dark:border-gray-700">
                <div className="flex items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                    <div className={`flex items-center gap-2 sm:gap-3 ${isToday ? 'scale-105' : ''}`}>
                      <div className={`text-xs sm:text-sm font-bold uppercase tracking-wider ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-500 dark:text-gray-400'}`}>
                        {format(day, 'EEE')}
                      </div>
                      <div className="h-8 sm:h-10 w-px bg-gray-300 dark:bg-gray-600"></div>
                      <div className={`text-xl sm:text-2xl md:text-3xl font-bold ${isToday ? 'text-primary-600 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                        {format(day, 'MMM d')}
                      </div>
                    </div>
                    {isToday && (
                      <span className="px-3 py-1 sm:px-4 sm:py-1.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-full font-bold text-[10px] sm:text-xs shadow-lg animate-pulse whitespace-nowrap">
                        TODAY
                      </span>
                    )}
                  </div>

                  {/* Day Stats */}
                  <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 text-xs sm:text-sm">
                    {dayCalories > 0 && (
                      <div className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:px-3 sm:py-1.5 bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400 rounded-lg font-medium whitespace-nowrap">
                        <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        <span className="text-[11px] sm:text-sm">{dayCalories}</span>
                      </div>
                    )}
                    {dayHealthBenefits.size > 0 && (
                      <div className="hidden sm:flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        {Array.from(dayHealthBenefits).slice(0, 2).map(benefit => (
                          <FoodBenefitIcon key={benefit} benefit={benefit} size="sm" />
                        ))}
                        {dayHealthBenefits.size > 2 && (
                          <span className="text-[10px] text-gray-600 dark:text-gray-400">+{dayHealthBenefits.size - 2}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Meal Type Summary Bar - Hidden on mobile */}
                <div className="mt-3 hidden md:flex flex-wrap gap-2">
                  {meals.map(({ type, meal }) => (
                    <div key={type} className="flex items-center gap-2 px-2.5 py-1 bg-gray-50 dark:bg-gray-800 rounded-lg text-[11px]">
                      <span className="font-semibold text-gray-700 dark:text-gray-300 capitalize">{type}:</span>
                      <span className="text-gray-600 dark:text-gray-400 truncate max-w-[120px]">{meal.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Meals Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {meals.map(({ type, meal }) => {
                  const isFav = favoriteMeals.some(f => f.id === meal.id);
                  return (
                    <MealCard
                      key={type}
                      meal={meal}
                      mealType={type}
                      isFavorite={isFav}
                      onToggleFavorite={() => toggleFavorite(meal)}
                      bloodTypes={bloodTypes}
                    />
                  );
                })}
              </div>

              {/* Workout card for this day */}
              <WorkoutDayCard
                dayName={format(day, 'EEEE')}
                onNavigateToFitness={onNavigateToFitness}
              />
            </div>
          );
        })}
      </div>

      {filteredDays.length === 0 && (
        <div className="card p-12 text-center">
          <div className="text-gray-400 dark:text-gray-500 mb-3">
            <Search className="w-12 h-12 mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400 font-medium">No meals match your search criteria.</p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Try adjusting your filters or search terms.</p>
        </div>
      )}
    </div>
  );
}
