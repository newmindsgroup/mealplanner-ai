import { useState } from 'react';
import { ChevronDown, Info, Check } from 'lucide-react';
import type { BloodType } from '../types';
import { getAllBloodTypes, getFoodCompatibility } from '../utils/bloodTypeUtils';

interface BloodTypeSelectorProps {
  value: BloodType;
  onChange: (value: BloodType) => void;
  label?: string;
  showInfo?: boolean;
  className?: string;
}

export default function BloodTypeSelector({
  value,
  onChange,
  label = 'Blood Type',
  showInfo = false,
  className = '',
}: BloodTypeSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showCompatibility, setShowCompatibility] = useState(false);
  const bloodTypes = getAllBloodTypes();

  const compatibility = showCompatibility ? getFoodCompatibility(value) : null;

  return (
    <div className={`relative ${className}`}>
      <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">{label}</label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="input w-full flex items-center justify-between pr-4"
          aria-label="Select blood type"
        >
          <span className="font-semibold text-gray-900 dark:text-white">{value}</span>
          <ChevronDown
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </button>

        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />
            <div className="absolute z-20 w-full mt-2 card p-2 max-h-64 overflow-y-auto scrollbar-thin">
              {bloodTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    onChange(type);
                    setIsOpen(false);
                  }}
                  className={`w-full px-4 py-2.5 text-left rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center justify-between ${
                    value === type
                      ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-semibold'
                      : 'text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <span className="font-medium">{type}</span>
                  {value === type && (
                    <Check className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {showInfo && (
        <button
          type="button"
          onClick={() => setShowCompatibility(!showCompatibility)}
          className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
        >
          <Info className="w-3.5 h-3.5" />
          {showCompatibility ? 'Hide' : 'Show'} food compatibility
        </button>
      )}

      {showCompatibility && compatibility && (
        <div className="mt-3 card p-4 space-y-3 animate-fade-in">
          <div>
            <span className="font-semibold text-green-700 dark:text-green-400 text-sm">✓ Beneficial: </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {compatibility.beneficial.slice(0, 5).join(', ')}
              {compatibility.beneficial.length > 5 && '...'}
            </span>
          </div>
          <div>
            <span className="font-semibold text-red-700 dark:text-red-400 text-sm">✕ Avoid: </span>
            <span className="text-gray-600 dark:text-gray-400 text-sm">
              {compatibility.avoid.slice(0, 5).join(', ')}
              {compatibility.avoid.length > 5 && '...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
