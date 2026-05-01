import { useState } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Trash2 } from 'lucide-react';
import type { Person } from '../../types';
import { useStore } from '../../store/useStore';
import EnhancedFoodCard from './EnhancedFoodCard';

interface MyCustomFoodsProps {
  selectedPerson: Person;
}

export default function MyCustomFoods({ selectedPerson }: MyCustomFoodsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { userFoodGuides, removeCustomFood } = useStore();

  const userGuide = userFoodGuides.find(g => g.userId === selectedPerson.id);
  const customFoods = userGuide?.customFoods || [];

  if (customFoods.length === 0) {
    return null;
  }

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className="w-full card p-4 flex items-center justify-between hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition-colors border-2 border-indigo-200 dark:border-indigo-800"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">My Custom Foods</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {customFoods.length} AI-added {customFoods.length === 1 ? 'food' : 'foods'}
            </p>
          </div>
        </div>
        <ChevronDown className="w-5 h-5 text-gray-500" />
      </button>
    );
  }

  return (
    <div className="card bg-gradient-to-r from-indigo-50 via-white to-indigo-50 dark:from-indigo-950/20 dark:via-gray-900 dark:to-indigo-950/20 border-2 border-indigo-200 dark:border-indigo-800 overflow-hidden">
      <div className="p-4 border-b border-indigo-200 dark:border-indigo-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">My Custom Foods</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Foods you've added with AI • {customFoods.length} total
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(false)}
          className="p-2 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
        >
          <ChevronUp className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customFoods.map((food) => (
            <EnhancedFoodCard
              key={food.id}
              food={food}
              bloodType={selectedPerson.bloodType}
              isCustom={true}
              onRemove={() => removeCustomFood(selectedPerson.id, food.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

