// Household Settings Component
import React, { useState } from 'react';
import { Settings, Save, Trash2, Loader } from 'lucide-react';
import type { Household, HouseholdSettings as HouseholdSettingsType } from '../../types/household';
import { householdService } from '../../services/householdService';
import { useHousehold } from '../../contexts/HouseholdContext';

interface HouseholdSettingsProps {
  household: Household;
}

export default function HouseholdSettings({ household }: HouseholdSettingsProps) {
  const { refreshHouseholds } = useHousehold();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [name, setName] = useState(household.name);
  const [settings, setSettings] = useState<HouseholdSettingsType>(household.settings);

  const handleSave = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await householdService.updateHousehold(household.id, {
        name,
        settings,
      });

      if (response.success) {
        setSuccess(true);
        await refreshHouseholds();
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(response.error || 'Failed to update household');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this household? This action cannot be undone.')) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await householdService.deleteHousehold(household.id);

      if (response.success) {
        await refreshHouseholds();
      } else {
        setError(response.error || 'Failed to delete household');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Household Settings
        </h2>

        {error && (
          <div className="mb-4 p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 text-sm">
            Settings saved successfully!
          </div>
        )}

        <div className="space-y-6">
          {/* Household Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Household Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              placeholder="e.g., Smith Family"
            />
          </div>

          {/* Settings Toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-white">
                  Allow Member Invites
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Members can invite others to the household
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowMemberInvites: !settings.allowMemberInvites })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowMemberInvites
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowMemberInvites ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-white">
                  Require Approval
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  New members must be approved by admins
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, requireApproval: !settings.requireApproval })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.requireApproval
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <label className="font-medium text-gray-900 dark:text-white">
                  Allow Guest Access
                </label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Allow temporary guest access to meal plans
                </p>
              </div>
              <button
                onClick={() => setSettings({ ...settings, allowGuestAccess: !settings.allowGuestAccess })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  settings.allowGuestAccess
                    ? 'bg-primary-600'
                    : 'bg-gray-200 dark:bg-gray-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    settings.allowGuestAccess ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Meal Plan Visibility
              </label>
              <select
                value={settings.mealPlanVisibility}
                onChange={(e) => setSettings({ ...settings, mealPlanVisibility: e.target.value as any })}
                className="input"
              >
                <option value="all">All Members</option>
                <option value="admins">Admins Only</option>
                <option value="owner">Owner Only</option>
              </select>
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="btn-primary w-full"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="card p-6 border-2 border-red-200 dark:border-red-900/30">
        <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-4">
          Danger Zone
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Once you delete a household, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDelete}
          disabled={isLoading}
          className="btn-secondary text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <Trash2 className="w-5 h-5 mr-2" />
          Delete Household
        </button>
      </div>
    </div>
  );
}

