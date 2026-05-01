import { useState } from 'react';
import { Heart, Clock, ChevronDown, ChevronUp, Sparkles, Users, Utensils, Beef, Carrot, Wheat, Apple, Milk, ChefHat, BookOpen, Activity } from 'lucide-react';
import type { Meal, MealType, BloodType, FoodCategory } from '../types';
import FoodBenefitBadge, { FoodBenefitIcon } from './food-guide/FoodBenefitBadge';
import MealComponentBreakdown, { MealComponentGrid } from './MealComponentBreakdown';
import { formatCalories, formatNutrition } from '../utils/numberFormat';

interface MealCardProps {
  meal: Meal;
  mealType: MealType;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  bloodTypes?: BloodType[];
}

const mealTypeStyles: Record<MealType, { 
  bg: string; 
  badge: string; 
  badgeBorder: string;
  timeColor: string;
  icon: string;
}> = {
  breakfast: {
    bg: 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-950/30 dark:to-amber-950/30',
    badge: 'bg-yellow-100 dark:bg-yellow-900/40',
    badgeBorder: 'border-yellow-300 dark:border-yellow-800',
    timeColor: 'text-amber-700 dark:text-amber-400',
    icon: 'text-yellow-600 dark:text-yellow-400',
  },
  lunch: {
    bg: 'bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30',
    badge: 'bg-blue-100 dark:bg-blue-900/40',
    badgeBorder: 'border-blue-300 dark:border-blue-800',
    timeColor: 'text-blue-700 dark:text-blue-400',
    icon: 'text-blue-600 dark:text-blue-400',
  },
  dinner: {
    bg: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30',
    badge: 'bg-purple-100 dark:bg-purple-900/40',
    badgeBorder: 'border-purple-300 dark:border-purple-800',
    timeColor: 'text-purple-700 dark:text-purple-400',
    icon: 'text-purple-600 dark:text-purple-400',
  },
  snack: {
    bg: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30',
    badge: 'bg-green-100 dark:bg-green-900/40',
    badgeBorder: 'border-green-300 dark:border-green-800',
    timeColor: 'text-green-700 dark:text-green-400',
    icon: 'text-green-600 dark:text-green-400',
  },
};

const categoryIcons: Record<FoodCategory, typeof Beef> = {
  proteins: Beef,
  vegetables: Carrot,
  grains: Wheat,
  fruits: Apple,
  dairy: Milk,
  oils: ChefHat,
  'nuts-seeds': ChefHat,
  beverages: ChefHat,
  spices: ChefHat,
  sweeteners: ChefHat,
};

export default function MealCard({ meal, mealType, isFavorite, onToggleFavorite, bloodTypes }: MealCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const styles = mealTypeStyles[mealType];
  const totalTime = meal.totalTime || (meal.prepTime + meal.cookTime);

  return (
    <div className={`${styles.bg} rounded-xl p-3 sm:p-4 transition-all duration-200 hover:shadow-lg border-2 border-transparent hover:border-gray-200 dark:hover:border-gray-700 overflow-hidden min-w-0 max-w-full`}>
      {/* Header Row - Badge, Time, Serving, Heart */}
      <div className="flex items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
        <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border ${styles.badge} ${styles.badgeBorder} text-gray-700 dark:text-gray-300 whitespace-nowrap`}>
            {mealType}
          </span>
          {totalTime > 0 && (
            <div className={`flex items-center gap-0.5 sm:gap-1 text-[11px] sm:text-xs font-medium ${styles.timeColor} whitespace-nowrap`}>
              <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
              <span>{totalTime}m</span>
            </div>
          )}
          {meal.servingSize && (
            <div className={`hidden sm:flex items-center gap-1 text-xs font-medium ${styles.timeColor}`}>
              <Utensils className="w-3.5 h-3.5" />
              <span className="truncate max-w-[80px]">{meal.servingSize}</span>
            </div>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite();
          }}
          className={`p-2 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center ${
            isFavorite 
              ? 'text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30' 
              : 'text-gray-400 dark:text-gray-500 hover:text-red-400 dark:hover:text-red-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 sm:w-5 sm:h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Meal Title */}
      <h4 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 leading-tight line-clamp-2">
        {meal.name}
      </h4>

      {/* Description */}
      {meal.description && (
        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3 line-clamp-2 leading-relaxed">
          {meal.description}
        </p>
      )}

      {/* Health Benefits - Prominent Display */}
      {meal.healthBenefits && meal.healthBenefits.length > 0 && (
        <div className="mb-2 sm:mb-3">
          <div className="flex flex-wrap gap-1 sm:gap-1.5">
            {meal.healthBenefits.slice(0, 3).map((benefit) => (
              <FoodBenefitIcon key={benefit} benefit={benefit} size="sm" />
            ))}
            {meal.healthBenefits.length > 3 && (
              <div className="inline-flex items-center justify-center px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 rounded-full text-[10px] font-medium">
                +{meal.healthBenefits.length - 3}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Component Breakdown - At a glance */}
      {meal.componentBreakdown && (
        <div className="mb-2 sm:mb-3 overflow-x-auto scrollbar-thin">
          <div className="min-w-max">
            <MealComponentBreakdown breakdown={meal.componentBreakdown} size="sm" />
          </div>
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-center gap-1.5 text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors py-2.5 sm:py-3 mt-2 border-t border-gray-200 dark:border-gray-700 rounded-b-lg min-h-[44px]"
        aria-label={isExpanded ? 'Hide meal details' : 'View meal details'}
      >
        {isExpanded ? (
          <>
            <ChevronUp className="w-4 h-4" />
            <span>Hide details</span>
          </>
        ) : (
          <>
            <ChevronDown className="w-4 h-4" />
            <span>View details</span>
          </>
        )}
      </button>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t-2 border-gray-200 dark:border-gray-700 space-y-3 sm:space-y-4 animate-slide-down max-w-full overflow-x-hidden min-w-0">
          
          {/* Health Benefits - Full List */}
          {meal.healthBenefits && meal.healthBenefits.length > 0 && (
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Health Benefits</span>
              </h5>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {meal.healthBenefits.map((benefit) => (
                  <FoodBenefitBadge key={benefit} benefit={benefit} size="sm" />
                ))}
              </div>
            </div>
          )}

          {/* Component Breakdown - Detailed Grid */}
          {meal.componentBreakdown && (
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <ChefHat className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Meal Components</span>
              </h5>
              <MealComponentGrid breakdown={meal.componentBreakdown} />
            </div>
          )}

          {/* Ingredient Details - Grouped by Category */}
          {meal.ingredientDetails && meal.ingredientDetails.length > 0 && (
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Detailed Ingredients</span>
              </h5>
              <div className="space-y-1.5 sm:space-y-2">
                {meal.ingredientDetails.map((ingredient, idx) => {
                  const Icon = categoryIcons[ingredient.category];
                  const hasBloodTypeInfo = ingredient.bloodTypeStatus && bloodTypes && bloodTypes.length > 0;
                  
                  return (
                    <div key={idx} className="flex items-start gap-2 p-2 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 overflow-hidden">
                      <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 dark:text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <div className="flex items-start gap-1.5 flex-wrap">
                          <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white break-words max-w-full" title={ingredient.name}>
                            {ingredient.name}
                          </span>
                          {ingredient.serving && (
                            <span className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                              ({ingredient.serving})
                            </span>
                          )}
                        </div>
                        {ingredient.healthBenefits && ingredient.healthBenefits.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                            {ingredient.healthBenefits.slice(0, 3).map((benefit) => (
                              <FoodBenefitIcon key={benefit} benefit={benefit} size="sm" />
                            ))}
                            {ingredient.healthBenefits.length > 3 && (
                              <span className="text-[9px] text-gray-500 dark:text-gray-400 flex-shrink-0">+{ingredient.healthBenefits.length - 3}</span>
                            )}
                          </div>
                        )}
                        {hasBloodTypeInfo && (
                          <div className="flex flex-wrap gap-1 mt-1 max-w-full overflow-hidden">
                            {bloodTypes!.map(bt => {
                              const status = ingredient.bloodTypeStatus![bt];
                              const statusColor = status === 'beneficial' ? 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' 
                                : status === 'neutral' ? 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
                                : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800';
                              return (
                                <span key={bt} className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded border font-medium ${statusColor} whitespace-nowrap`}>
                                  {bt}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blood Type Context */}
          {meal.bloodTypeExplanations && bloodTypes && bloodTypes.length > 0 && (
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span className="line-clamp-1">Blood Type Compatibility</span>
              </h5>
              <div className="space-y-2">
                {bloodTypes.map(bt => (
                  <div key={bt} className="p-2 sm:p-2.5 rounded-lg bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 text-[10px] sm:text-[11px] font-bold rounded whitespace-nowrap">
                        Type {bt}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {meal.bloodTypeExplanations?.[bt] || 'Compatible with this blood type.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standard Ingredients (if no detailed ingredients) */}
          {(!meal.ingredientDetails || meal.ingredientDetails.length === 0) && meal.ingredients.length > 0 && (
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Ingredients</span>
              </h5>
              <div className="flex flex-wrap gap-1 sm:gap-1.5">
                {meal.ingredients.map((ing, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] sm:text-xs px-2 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 font-medium break-words"
                  >
                    {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          {meal.instructions.length > 0 && (
            <div>
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Cooking Instructions</span>
              </h5>
              <ol className="space-y-2">
                {meal.instructions.map((step, idx) => (
                  <li key={idx} className="flex gap-2 sm:gap-2.5 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-bold text-[10px] flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <span className="flex-1">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Rationale */}
          {meal.rationale && (
            <div className={`p-2.5 sm:p-3 rounded-lg border-2 ${styles.badgeBorder} ${styles.bg}`}>
              <h5 className="text-xs sm:text-sm font-bold mb-1.5 flex items-center gap-1.5">
                <Sparkles className={`w-3.5 h-3.5 ${styles.icon} flex-shrink-0`} />
                <span>Why This Meal Works</span>
              </h5>
              <p className={`text-xs sm:text-sm ${styles.timeColor} leading-relaxed`}>{meal.rationale}</p>
            </div>
          )}

          {/* Tags */}
          {meal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-1.5">
              {meal.tags.map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] sm:text-[11px] px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md font-medium border border-gray-200 dark:border-gray-600 whitespace-nowrap"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Enhanced Nutritional Info */}
          {meal.nutritionalInfo && (
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white mb-2 sm:mb-3 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-primary-500 flex-shrink-0" />
                <span>Nutritional Information</span>
              </h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {meal.nutritionalInfo.calories && (
                  <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Calories</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{formatCalories(meal.nutritionalInfo.calories)}</div>
                  </div>
                )}
                {meal.nutritionalInfo.protein && (
                  <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Protein</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{formatNutrition(meal.nutritionalInfo.protein)}g</div>
                  </div>
                )}
                {meal.nutritionalInfo.carbs && (
                  <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Carbs</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{formatNutrition(meal.nutritionalInfo.carbs)}g</div>
                  </div>
                )}
                {meal.nutritionalInfo.fats && (
                  <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Fats</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{formatNutrition(meal.nutritionalInfo.fats)}g</div>
                  </div>
                )}
                {meal.nutritionalInfo.fiber && (
                  <div className="text-center p-2 bg-white dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                    <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wide">Fiber</div>
                    <div className="text-sm sm:text-base font-bold text-gray-900 dark:text-white">{formatNutrition(meal.nutritionalInfo.fiber)}g</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
