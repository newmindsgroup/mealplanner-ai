import { useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Download, Printer } from 'lucide-react';
import { bloodTypeFoodDatabase, categoryLabels, type FoodItem } from '../../data/bloodTypeFoods';
import type { BloodType } from '../../types';
import EnhancedFoodCard from './EnhancedFoodCard';

interface FoodsToAvoidGuideProps {
  bloodType: BloodType;
  onClose?: () => void;
}

export default function FoodsToAvoidGuide({ bloodType, onClose }: FoodsToAvoidGuideProps) {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const avoidFoodsByCategory = useMemo(() => {
    const foodsByCategory: Record<string, FoodItem[]> = {};
    
    bloodTypeFoodDatabase.forEach(food => {
      if (food.classification[bloodType] === 'avoid') {
        if (!foodsByCategory[food.category]) {
          foodsByCategory[food.category] = [];
        }
        foodsByCategory[food.category].push(food);
      }
    });

    // Sort each category's foods alphabetically
    Object.keys(foodsByCategory).forEach(category => {
      foodsByCategory[category].sort((a, b) => a.name.localeCompare(b.name));
    });

    return foodsByCategory;
  }, [bloodType]);

  const totalAvoidFoods = useMemo(() => {
    return Object.values(avoidFoodsByCategory).reduce((sum, foods) => sum + foods.length, 0);
  }, [avoidFoodsByCategory]);

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    let csvContent = `Foods to Avoid for Blood Type ${bloodType}\n\n`;
    
    Object.entries(avoidFoodsByCategory).forEach(([category, foods]) => {
      csvContent += `\n${categoryLabels[category as keyof typeof categoryLabels]}\n`;
      csvContent += 'Food Name,Serving Size,Concerns\n';
      foods.forEach(food => {
        const concerns = food.concerns || food.avoidanceDetails?.scientificReason || 'See detailed information';
        csvContent += `"${food.name}","${food.servingSize || 'N/A'}","${concerns.replace(/"/g, '""')}"\n`;
      });
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `avoid-foods-type-${bloodType}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-6 bg-red-50 dark:bg-red-950/20 border-2 border-red-300 dark:border-red-800">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-200">
                Foods to Avoid for Blood Type {bloodType}
              </h2>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                {totalAvoidFoods} foods that may cause adverse reactions
              </p>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200 font-medium"
            >
              ✕
            </button>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
            <strong>Important:</strong> The foods listed below may trigger adverse reactions in individuals with blood type {bloodType} according to the Blood Type Diet. 
            Pay attention to your body's signals and keep a food diary to identify personal sensitivities. Always consult with a healthcare professional before making significant dietary changes.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handlePrint}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Print Guide
          </button>
          <button
            onClick={handleExport}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {Object.entries(avoidFoodsByCategory).map(([category, foods]) => {
          const isExpanded = expandedCategories.has(category);
          
          return (
            <div
              key={category}
              className="card border-2 border-red-200 dark:border-red-800"
            >
              <button
                onClick={() => toggleCategory(category)}
                className="w-full p-4 flex items-center justify-between text-left hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                      {categoryLabels[category as keyof typeof categoryLabels]}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {foods.length} food{foods.length !== 1 ? 's' : ''} to avoid
                    </p>
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>

              {isExpanded && (
                <div className="p-4 pt-0 border-t border-red-200 dark:border-red-800 animate-slideUp">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {foods.map(food => (
                      <EnhancedFoodCard
                        key={food.id}
                        food={food}
                        bloodType={bloodType}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer Note */}
      <div className="card p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <strong>Tracking Your Reactions:</strong> Each food card above can be expanded to see detailed information about symptoms, 
          timelines, and how to identify if a food is affecting you. Click on any food to learn more and see suggested alternatives.
        </p>
      </div>
    </div>
  );
}

