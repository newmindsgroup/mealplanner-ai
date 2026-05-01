import { useState } from 'react';
import { X, Sparkles, Check, AlertCircle, Loader } from 'lucide-react';
import type { BloodType } from '../../types';
import type { FoodItem } from '../../data/bloodTypeFoods';
import { createFoodItemFromAI, createFoodInquiry } from '../../services/foodInquiryService';
import { useStore } from '../../store/useStore';
import FoodBenefitBadge from './FoodBenefitBadge';

interface AddFoodModalProps {
  bloodType: BloodType;
  userId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AddFoodModal({ bloodType, userId, onClose, onSuccess }: AddFoodModalProps) {
  const [foodName, setFoodName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [aiResult, setAiResult] = useState<FoodItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { addCustomFood, addFoodInquiry } = useStore();

  const handleAnalyze = async () => {
    if (!foodName.trim()) {
      setError('Please enter a food name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const foodItem = await createFoodItemFromAI(foodName, bloodType, userId);
      const inquiry = await createFoodInquiry(foodName, bloodType);
      
      setAiResult(foodItem);
      addFoodInquiry(inquiry);
    } catch (err) {
      setError('Failed to analyze food. Please try again.');
      console.error('Error analyzing food:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdd = () => {
    if (aiResult) {
      addCustomFood(userId, aiResult);
      if (onSuccess) onSuccess();
      onClose();
    }
  };

  const classification = aiResult?.classification[bloodType];
  const colors = {
    beneficial: {
      bg: 'bg-green-50 dark:bg-green-950/20',
      border: 'border-green-300 dark:border-green-700',
      text: 'text-green-700 dark:text-green-400',
      badge: 'bg-green-500 text-white',
    },
    neutral: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-300 dark:border-blue-700',
      text: 'text-blue-700 dark:text-blue-400',
      badge: 'bg-blue-500 text-white',
    },
    avoid: {
      bg: 'bg-red-50 dark:bg-red-950/20',
      border: 'border-red-300 dark:border-red-700',
      text: 'text-red-700 dark:text-red-400',
      badge: 'bg-red-500 text-white',
    },
  };

  const style = classification ? colors[classification] : null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Add Custom Food</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                AI-powered food classification for Type {bloodType}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Input Section */}
          {!aiResult && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Food Name
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAnalyze()}
                  placeholder="e.g., Dragon Fruit, Quinoa Pasta, Kombucha"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                onClick={handleAnalyze}
                disabled={isLoading || !foodName.trim()}
                className="w-full btn btn-primary flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Analyzing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Analyze Food</span>
                  </>
                )}
              </button>

              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                <p>Our AI will analyze the food and determine if it's beneficial, neutral, or should be avoided for your blood type.</p>
              </div>
            </div>
          )}

          {/* Results Section */}
          {aiResult && style && (
            <div className="space-y-4">
              {/* Classification Result */}
              <div className={`p-6 rounded-lg border-2 ${style.border} ${style.bg}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {aiResult.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {aiResult.category.charAt(0).toUpperCase() + aiResult.category.slice(1)}
                    </p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-bold ${style.badge}`}>
                    {classification === 'beneficial' && '✓ Beneficial'}
                    {classification === 'neutral' && '○ Neutral'}
                    {classification === 'avoid' && '✗ Avoid'}
                  </span>
                </div>

                {/* Health Benefits */}
                {aiResult.healthBenefits && aiResult.healthBenefits.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {aiResult.healthBenefits.map((benefit) => (
                      <FoodBenefitBadge key={benefit} benefit={benefit} size="sm" />
                    ))}
                  </div>
                )}

                {/* Explanation */}
                {aiResult.detailedExplanations?.[bloodType] && (
                  <div className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                      {aiResult.detailedExplanations[bloodType]}
                    </p>
                  </div>
                )}

                {/* Nutritional Info */}
                {aiResult.nutritionalInfo && (
                  <div className="flex flex-wrap gap-3 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {aiResult.nutritionalInfo.calories && (
                      <span className="font-medium">{aiResult.nutritionalInfo.calories} cal</span>
                    )}
                    {aiResult.nutritionalInfo.protein && (
                      <span>{aiResult.nutritionalInfo.protein}g protein</span>
                    )}
                    {aiResult.nutritionalInfo.carbs && (
                      <span>{aiResult.nutritionalInfo.carbs}g carbs</span>
                    )}
                    {aiResult.nutritionalInfo.fats && (
                      <span>{aiResult.nutritionalInfo.fats}g fats</span>
                    )}
                  </div>
                )}

                {/* Serving Size */}
                {aiResult.servingSize && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Serving: {aiResult.servingSize}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setAiResult(null);
                    setFoodName('');
                  }}
                  className="flex-1 btn btn-secondary"
                >
                  Analyze Another
                </button>
                <button
                  onClick={handleAdd}
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                >
                  <Check className="w-5 h-5" />
                  <span>Add to My Foods</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

