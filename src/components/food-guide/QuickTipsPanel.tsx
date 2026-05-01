import { useState } from 'react';
import { ChevronDown, ChevronUp, Lightbulb, Star, AlertTriangle, Utensils } from 'lucide-react';
import type { BloodType } from '../../types';
import { getFoodsByBloodType } from '../../data/bloodTypeFoods';

interface QuickTipsPanelProps {
  bloodType: BloodType;
}

const quickMealIdeas: Record<BloodType, string[]> = {
  'O+': [
    'Grilled beef with roasted sweet potatoes and broccoli',
    'Salmon salad with spinach, walnuts, and olive oil dressing',
    'Lamb stew with carrots, onions, and herbs',
  ],
  'O-': [
    'Grilled beef with roasted sweet potatoes and broccoli',
    'Salmon salad with spinach, walnuts, and olive oil dressing',
    'Lamb stew with carrots, onions, and herbs',
  ],
  'A+': [
    'Oatmeal with blueberries, almonds, and green tea',
    'Tofu stir-fry with broccoli, carrots, and brown rice',
    'Sardines on whole grain toast with cucumber slices',
  ],
  'A-': [
    'Oatmeal with blueberries, almonds, and green tea',
    'Tofu stir-fry with broccoli, carrots, and brown rice',
    'Sardines on whole grain toast with cucumber slices',
  ],
  'B+': [
    'Greek yogurt with banana, grape, and flax seeds',
    'Lamb curry with brown rice and bell peppers',
    'Grilled salmon with steamed cabbage and sweet potato',
  ],
  'B-': [
    'Greek yogurt with banana, grape, and flax seeds',
    'Lamb curry with brown rice and bell peppers',
    'Grilled salmon with steamed cabbage and sweet potato',
  ],
  'AB+': [
    'Turkey and mozzarella wrap with spinach and tomato',
    'Tofu and vegetable soup with miso broth',
    'Grilled lamb with quinoa and roasted vegetables',
  ],
  'AB-': [
    'Turkey and mozzarella wrap with spinach and tomato',
    'Tofu and vegetable soup with miso broth',
    'Grilled lamb with quinoa and roasted vegetables',
  ],
};

const nutritionTips: Record<BloodType, string[]> = {
  'O+': [
    'Focus on lean, organic meats as your primary protein source',
    'Eat plenty of vegetables and fruits, especially dark leafy greens',
    'Limit grains and legumes, especially wheat products',
  ],
  'O-': [
    'Focus on lean, organic meats as your primary protein source',
    'Eat plenty of vegetables and fruits, especially dark leafy greens',
    'Limit grains and legumes, especially wheat products',
  ],
  'A+': [
    'Prioritize plant-based proteins like tofu, tempeh, and legumes',
    'Choose whole grains over refined grains',
    'Avoid red meat and focus on fish for animal protein',
  ],
  'A-': [
    'Prioritize plant-based proteins like tofu, tempeh, and legumes',
    'Choose whole grains over refined grains',
    'Avoid red meat and focus on fish for animal protein',
  ],
  'B+': [
    'Enjoy a varied diet with both meat and dairy products',
    'Include a balance of vegetables, fruits, and whole grains',
    'Avoid corn, wheat, peanuts, and sesame seeds',
  ],
  'B-': [
    'Enjoy a varied diet with both meat and dairy products',
    'Include a balance of vegetables, fruits, and whole grains',
    'Avoid corn, wheat, peanuts, and sesame seeds',
  ],
  'AB+': [
    'Combine the best of Type A and B diets',
    'Focus on seafood, dairy, tofu, and most vegetables',
    'Eat smaller, more frequent meals for better digestion',
  ],
  'AB-': [
    'Combine the best of Type A and B diets',
    'Focus on seafood, dairy, tofu, and most vegetables',
    'Eat smaller, more frequent meals for better digestion',
  ],
};

export default function QuickTipsPanel({ bloodType }: QuickTipsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const beneficialFoods = getFoodsByBloodType(bloodType, 'beneficial').slice(0, 5);
  const avoidFoods = getFoodsByBloodType(bloodType, 'avoid').slice(0, 5);
  const mealIdeas = quickMealIdeas[bloodType];
  const tips = nutritionTips[bloodType];

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full card p-4 flex items-center justify-between hover:bg-amber-50 dark:hover:bg-amber-950/20 transition-colors border-2 border-amber-200 dark:border-amber-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Quick Tips</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Top foods and meal ideas for Type {bloodType}
            </p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </button>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-amber-50 via-white to-amber-50 dark:from-amber-950/20 dark:via-gray-900 dark:to-amber-950/20 border-2 border-amber-200 dark:border-amber-800 overflow-hidden">
      <div className="p-4 border-b border-amber-200 dark:border-amber-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">
              Quick Tips for Type {bloodType}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your personalized food guide at a glance
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-lg transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6 grid md:grid-cols-2 gap-6">
        {/* Top Beneficial Foods */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-green-600 dark:text-green-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Top 5 Beneficial Foods</h4>
          </div>
          <ul className="space-y-2">
            {beneficialFoods.map((food) => (
              <li
                key={food.id}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></span>
                <span className="font-medium">{food.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Foods to Avoid */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Top 5 Foods to Avoid</h4>
          </div>
          <ul className="space-y-2">
            {avoidFoods.map((food) => (
              <li
                key={food.id}
                className="flex items-center gap-2 text-gray-700 dark:text-gray-300"
              >
                <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0"></span>
                <span className="font-medium">{food.name}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Meal Ideas */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Quick Meal Ideas</h4>
          </div>
          <ul className="space-y-2">
            {mealIdeas.map((idea, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-blue-600 dark:text-blue-400 font-bold flex-shrink-0 mt-0.5">
                  {index + 1}.
                </span>
                <span>{idea}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Daily Nutrition Tips */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            <h4 className="font-semibold text-gray-900 dark:text-white">Daily Nutrition Tips</h4>
          </div>
          <ul className="space-y-2">
            {tips.map((tip, index) => (
              <li
                key={index}
                className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
              >
                <span className="text-amber-600 dark:text-amber-400 flex-shrink-0 mt-1">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

