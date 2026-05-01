import { X } from 'lucide-react';
import type { FoodCategory, StorageLocation } from '../../types';

interface PantryFiltersProps {
  selectedCategory: FoodCategory | 'all';
  selectedLocation: StorageLocation | 'all';
  filterStatus: 'all' | 'low-stock' | 'expiring' | 'expired';
  onCategoryChange: (category: FoodCategory | 'all') => void;
  onLocationChange: (location: StorageLocation | 'all') => void;
  onStatusChange: (status: 'all' | 'low-stock' | 'expiring' | 'expired') => void;
  onReset: () => void;
}

export default function PantryFilters({
  selectedCategory,
  selectedLocation,
  filterStatus,
  onCategoryChange,
  onLocationChange,
  onStatusChange,
  onReset,
}: PantryFiltersProps) {
  const categories: Array<FoodCategory | 'all'> = [
    'all', 'proteins', 'vegetables', 'fruits', 'grains', 'dairy',
    'oils', 'nuts-seeds', 'beverages', 'spices', 'sweeteners'
  ];

  const locations: Array<StorageLocation | 'all'> = [
    'all', 'pantry', 'refrigerator', 'freezer', 'cabinet', 'counter', 'other'
  ];

  const statuses: Array<{ value: 'all' | 'low-stock' | 'expiring' | 'expired'; label: string }> = [
    { value: 'all', label: 'All Items' },
    { value: 'low-stock', label: 'Low Stock' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' },
  ];

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    selectedLocation !== 'all' || 
    filterStatus !== 'all';

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4 animate-fade-in">
      {/* Category Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Category
        </label>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category === 'all' ? 'All' : category.replace('-', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Location Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Storage Location
        </label>
        <div className="flex flex-wrap gap-2">
          {locations.map((location) => (
            <button
              key={location}
              onClick={() => onLocationChange(location)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedLocation === location
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {location === 'all' ? 'All' : location}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Status
        </label>
        <div className="flex flex-wrap gap-2">
          {statuses.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onStatusChange(value)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                filterStatus === value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Reset Button */}
      {hasActiveFilters && (
        <div className="pt-2">
          <button
            onClick={onReset}
            className="btn btn-secondary text-sm"
          >
            <X className="w-4 h-4" />
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}

