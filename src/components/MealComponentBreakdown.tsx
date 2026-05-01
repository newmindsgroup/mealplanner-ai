import { Beef, Carrot, Wheat, Apple, Milk, Droplet, Leaf, ChefHat } from 'lucide-react';
import type { ComponentBreakdown } from '../types';

interface MealComponentBreakdownProps {
  breakdown: ComponentBreakdown;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

const categoryConfig = {
  proteins: {
    icon: Beef,
    label: 'Proteins',
    color: 'text-red-700 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
  },
  vegetables: {
    icon: Carrot,
    label: 'Vegetables',
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
  },
  grains: {
    icon: Wheat,
    label: 'Grains',
    color: 'text-amber-700 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-950/30',
    borderColor: 'border-amber-200 dark:border-amber-800',
  },
  fruits: {
    icon: Apple,
    label: 'Fruits',
    color: 'text-pink-700 dark:text-pink-400',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    borderColor: 'border-pink-200 dark:border-pink-800',
  },
  dairy: {
    icon: Milk,
    label: 'Dairy',
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
  },
  oils: {
    icon: Droplet,
    label: 'Oils & Fats',
    color: 'text-yellow-700 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
  },
  'nuts-seeds': {
    icon: ChefHat,
    label: 'Nuts & Seeds',
    color: 'text-orange-700 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
  },
  beverages: {
    icon: Droplet,
    label: 'Beverages',
    color: 'text-cyan-700 dark:text-cyan-400',
    bgColor: 'bg-cyan-50 dark:bg-cyan-950/30',
    borderColor: 'border-cyan-200 dark:border-cyan-800',
  },
  spices: {
    icon: Leaf,
    label: 'Seasonings',
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    borderColor: 'border-purple-200 dark:border-purple-800',
  },
  sweeteners: {
    icon: ChefHat,
    label: 'Sweeteners',
    color: 'text-rose-700 dark:text-rose-400',
    bgColor: 'bg-rose-50 dark:bg-rose-950/30',
    borderColor: 'border-rose-200 dark:border-rose-800',
  },
  other: {
    icon: ChefHat,
    label: 'Other',
    color: 'text-gray-700 dark:text-gray-400',
    bgColor: 'bg-gray-50 dark:bg-gray-800/30',
    borderColor: 'border-gray-200 dark:border-gray-700',
  },
};

const sizeConfig = {
  sm: {
    iconSize: 'w-3 h-3',
    padding: 'px-1.5 py-1',
    text: 'text-[10px]',
    gap: 'gap-1',
  },
  md: {
    iconSize: 'w-4 h-4',
    padding: 'px-2 py-1.5',
    text: 'text-xs',
    gap: 'gap-1.5',
  },
  lg: {
    iconSize: 'w-5 h-5',
    padding: 'px-3 py-2',
    text: 'text-sm',
    gap: 'gap-2',
  },
};

export default function MealComponentBreakdown({ 
  breakdown, 
  size = 'md',
  showDetails = false 
}: MealComponentBreakdownProps) {
  const sizes = sizeConfig[size];
  
  const categories = [
    { key: 'proteins', items: breakdown.proteins },
    { key: 'vegetables', items: breakdown.vegetables },
    { key: 'grains', items: breakdown.grains },
    { key: 'fruits', items: breakdown.fruits },
    { key: 'dairy', items: breakdown.dairy },
    { key: 'other', items: breakdown.other },
  ].filter(cat => cat.items && cat.items.length > 0);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-1 sm:gap-2 max-w-full overflow-hidden">
      {categories.map(({ key, items }) => {
        const config = categoryConfig[key as keyof typeof categoryConfig];
        const Icon = config.icon;
        const count = items?.length || 0;

        return (
          <div
            key={key}
            className={`inline-flex items-center ${sizes.gap} ${sizes.padding} ${config.bgColor} ${config.borderColor} border rounded-lg ${sizes.text} font-medium ${config.color} transition-all hover:scale-105 whitespace-nowrap flex-shrink-0`}
            title={showDetails ? items?.join(', ') : `${count} ${config.label.toLowerCase()}`}
          >
            <Icon className={`${sizes.iconSize} flex-shrink-0`} />
            <span className="font-semibold hidden sm:inline truncate max-w-[80px]">{config.label}</span>
            <span className="font-semibold sm:hidden truncate max-w-[60px]">{config.label.split(' ')[0]}</span>
            <span className="opacity-75 flex-shrink-0">({count})</span>
          </div>
        );
      })}
    </div>
  );
}

export function MealComponentGrid({ breakdown }: { breakdown: ComponentBreakdown }) {
  const categories = [
    { key: 'proteins', items: breakdown.proteins },
    { key: 'vegetables', items: breakdown.vegetables },
    { key: 'grains', items: breakdown.grains },
    { key: 'fruits', items: breakdown.fruits },
    { key: 'dairy', items: breakdown.dairy },
    { key: 'other', items: breakdown.other },
  ].filter(cat => cat.items && cat.items.length > 0);

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 max-w-full">
      {categories.map(({ key, items }) => {
        const config = categoryConfig[key as keyof typeof categoryConfig];
        const Icon = config.icon;

        return (
          <div
            key={key}
            className={`p-2.5 sm:p-3 rounded-lg border ${config.borderColor} ${config.bgColor} overflow-hidden min-w-0`}
          >
            <div className={`flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 ${config.color} min-w-0`}>
              <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
              <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wide truncate">{config.label}</span>
            </div>
            <ul className="space-y-0.5 sm:space-y-1 overflow-hidden">
              {items?.map((item, idx) => (
                <li key={idx} className="text-[11px] sm:text-xs text-gray-700 dark:text-gray-300 pl-1 break-words overflow-wrap-anywhere" title={item}>
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>
  );
}

