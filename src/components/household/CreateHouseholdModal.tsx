// Create Household Modal Component
import React, { useState } from 'react';
import { X, Home, Loader } from 'lucide-react';
import { householdService } from '../../services/householdService';
import { useHousehold } from '../../contexts/HouseholdContext';

interface CreateHouseholdModalProps {
  onClose: () => void;
}

export default function CreateHouseholdModal({ onClose }: CreateHouseholdModalProps) {
  const { refreshHouseholds } = useHousehold();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [householdName, setHouseholdName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!householdName.trim()) {
      setError('Please enter a household name');
      return;
    }

    setIsLoading(true);

    try {
      const response = await householdService.createHousehold({
        name: householdName,
      });

      if (response.success) {
        await refreshHouseholds();
        onClose();
      } else {
        setError(response.error || 'Failed to create household');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-fade-in">
      <div className="card p-6 max-w-md w-full mx-4 animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Home className="w-6 h-6" />
            Create Household
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="householdName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Household Name
            </label>
            <input
              type="text"
              id="householdName"
              value={householdName}
              onChange={(e) => setHouseholdName(e.target.value)}
              className="input"
              placeholder="e.g., Smith Family"
              required
              autoFocus
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              This will be visible to all household members
            </p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin mr-2" />
                  Creating...
                </>
              ) : (
                'Create Household'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

