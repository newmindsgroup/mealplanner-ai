import { useState } from 'react';
import { ChevronDown, ChevronUp, Info, AlertTriangle, Clock, Activity, Lightbulb, RefreshCw } from 'lucide-react';
import type { FoodItem, FoodMealType } from '../../data/bloodTypeFoods';
import type { BloodType } from '../../types';
import FoodBenefitBadge, { FoodBenefitIcon } from './FoodBenefitBadge';
import { categoryLabels } from '../../data/bloodTypeFoods';

interface EnhancedFoodCardProps {
  food: FoodItem;
  bloodType: BloodType;
  isCustom?: boolean;
  onRemove?: () => void;
}

const mealTypeLabels: Record<FoodMealType, string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
  anytime: 'Anytime',
};

const mealTypeColors: Record<FoodMealType, string> = {
  breakfast: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  lunch: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  dinner: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  snack: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  anytime: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

export default function EnhancedFoodCard({ food, bloodType, isCustom, onRemove }: EnhancedFoodCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const classification = food.classification[bloodType];
  const colors = {
    beneficial: {
      border: 'border-green-300 dark:border-green-700',
      bg: 'bg-green-50 dark:bg-green-950/20',
      badge: 'bg-green-500 text-white',
      text: 'text-green-700 dark:text-green-400',
      hover: 'hover:border-green-400 dark:hover:border-green-600',
    },
    neutral: {
      border: 'border-blue-300 dark:border-blue-700',
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      badge: 'bg-blue-500 text-white',
      text: 'text-blue-700 dark:text-blue-400',
      hover: 'hover:border-blue-400 dark:hover:border-blue-600',
    },
    avoid: {
      border: 'border-red-300 dark:border-red-700',
      bg: 'bg-red-50 dark:bg-red-950/20',
      badge: 'bg-red-500 text-white',
      text: 'text-red-700 dark:text-red-400',
      hover: 'hover:border-red-400 dark:hover:border-red-600',
    },
  };

  const style = colors[classification];
  const detailedExplanation = food.detailedExplanations?.[bloodType];
  const avoidanceDetails = classification === 'avoid' ? food.avoidanceDetails : null;
  const hasExpandableContent = detailedExplanation || (food.healthBenefits && food.healthBenefits.length > 0) || avoidanceDetails;

  return (
    <div
      className={`card border-2 ${style.border} ${style.bg} ${style.hover} transition-all duration-200 ${
        isExpanded ? 'shadow-lg' : 'hover:shadow-md'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{food.name}</h3>
              {isCustom && (
                <span className="px-2 py-0.5 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-semibold rounded">
                  AI Added
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {categoryLabels[food.category]}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge} flex-shrink-0`}>
            {classification === 'beneficial' && '✓ Beneficial'}
            {classification === 'neutral' && '○ Neutral'}
            {classification === 'avoid' && '✗ Avoid'}
          </span>
        </div>

        {/* Health Benefits */}
        {food.healthBenefits && food.healthBenefits.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {food.healthBenefits.map((benefit) => (
              <FoodBenefitIcon key={benefit} benefit={benefit} size="sm" />
            ))}
          </div>
        )}

        {/* Meal Types */}
        {food.mealTypes && food.mealTypes.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">Best for:</span>
            {food.mealTypes.map((mealType) => (
              <span
                key={mealType}
                className={`px-2 py-0.5 rounded text-[10px] font-medium ${mealTypeColors[mealType]}`}
              >
                {mealTypeLabels[mealType]}
              </span>
            ))}
          </div>
        )}

        {/* Nutritional Info */}
        {food.nutritionalInfo && (
          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-3">
            {food.nutritionalInfo.calories && (
              <span className="font-medium">{food.nutritionalInfo.calories} cal</span>
            )}
            {food.nutritionalInfo.protein && (
              <span>{food.nutritionalInfo.protein}g protein</span>
            )}
            {food.nutritionalInfo.carbs && <span>{food.nutritionalInfo.carbs}g carbs</span>}
            {food.nutritionalInfo.fats && <span>{food.nutritionalInfo.fats}g fats</span>}
          </div>
        )}

        {/* Serving Size */}
        {food.servingSize && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
            Serving: {food.servingSize}
          </p>
        )}

        {/* Benefits/Concerns */}
        {(food.benefits || food.concerns) && (
          <div className={`text-xs ${style.text} py-2 border-t ${style.border}`}>
            {classification === 'beneficial' && food.benefits && <p>✓ {food.benefits}</p>}
            {classification === 'avoid' && food.concerns && <p>⚠ {food.concerns}</p>}
          </div>
        )}

        {/* Expand Button */}
        {hasExpandableContent && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full mt-3 px-3 py-2 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors ${
              isExpanded
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                : `${style.bg} ${style.text} hover:bg-opacity-70`
            }`}
          >
            <Info className="w-4 h-4" />
            <span>{isExpanded ? 'Hide Details' : 'Why This Classification?'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}

        {/* Expanded Content */}
        {isExpanded && detailedExplanation && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 animate-slideUp">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <Info className="w-4 h-4" />
              Why for Type {bloodType}?
            </h4>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              {detailedExplanation}
            </p>
          </div>
        )}

        {/* Avoidance Details (for avoid foods) */}
        {isExpanded && avoidanceDetails && (
          <div className="mt-3 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-2 border-red-300 dark:border-red-800 animate-slideUp space-y-4">
            {/* Scientific Reason */}
            <div>
              <h4 className="font-semibold text-red-900 dark:text-red-200 mb-2 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Why Avoid This Food?
              </h4>
              <p className="text-sm text-red-800 dark:text-red-300 leading-relaxed">
                {avoidanceDetails.scientificReason}
              </p>
            </div>

            {/* Symptoms & Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h5 className="font-semibold text-red-900 dark:text-red-200 mb-2 text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Potential Symptoms
                </h5>
                <ul className="space-y-1">
                  {avoidanceDetails.symptoms.map((symptom, index) => (
                    <li key={index} className="text-xs text-red-700 dark:text-red-300 flex items-start gap-1.5">
                      <span className="text-red-500 mt-0.5">•</span>
                      <span>{symptom}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h5 className="font-semibold text-red-900 dark:text-red-200 mb-2 text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Reaction Timeline
                </h5>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    avoidanceDetails.timeline === 'immediate' ? 'bg-red-600 text-white' :
                    avoidanceDetails.timeline === '30min-2hrs' ? 'bg-orange-500 text-white' :
                    avoidanceDetails.timeline === '2-6hrs' ? 'bg-yellow-500 text-white' :
                    avoidanceDetails.timeline === '12-24hrs' ? 'bg-blue-500 text-white' :
                    'bg-purple-500 text-white'
                  }`}>
                    {avoidanceDetails.timeline}
                  </span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                    avoidanceDetails.severity === 'severe' ? 'bg-red-600 text-white' :
                    avoidanceDetails.severity === 'moderate' ? 'bg-orange-500 text-white' :
                    'bg-yellow-500 text-white'
                  }`}>
                    {avoidanceDetails.severity.charAt(0).toUpperCase() + avoidanceDetails.severity.slice(1)} severity
                  </span>
                </div>
              </div>
            </div>

            {/* Tracking Tips */}
            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg border border-amber-300 dark:border-amber-800">
              <h5 className="font-semibold text-amber-900 dark:text-amber-200 mb-2 text-sm flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                How to Track Impact on Your Body
              </h5>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                {avoidanceDetails.trackingTips}
              </p>
            </div>

            {/* Alternatives */}
            {avoidanceDetails.alternatives && avoidanceDetails.alternatives.length > 0 && (
              <div>
                <h5 className="font-semibold text-green-900 dark:text-green-200 mb-2 text-sm flex items-center gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Better Alternatives
                </h5>
                <div className="flex flex-wrap gap-2">
                  {avoidanceDetails.alternatives.map((alt, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full font-medium"
                    >
                      {alt}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Remove Button (for custom foods) */}
        {isCustom && onRemove && (
          <button
            onClick={onRemove}
            className="w-full mt-3 px-3 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 font-medium text-sm transition-colors"
          >
            Remove Custom Food
          </button>
        )}
      </div>
    </div>
  );
}

