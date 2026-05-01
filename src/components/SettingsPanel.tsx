import { Moon, Sun, Volume2, ChefHat, Globe, Trash2, Settings as SettingsIcon, Mail, Bell, Key } from 'lucide-react';
import { useStore } from '../store/useStore';
import APIKeySettings from './APIKeySettings';
import SMTPSettings from './SMTPSettings';
import NotificationPreferences from './NotificationPreferences';

export default function SettingsPanel() {
  const { settings, updateSettings, progress } = useStore();

  const handleClearData = () => {
    if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const ToggleSwitch = ({ enabled, onChange, label, description }: { enabled: boolean; onChange: () => void; label: string; description?: string }) => (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">{description}</p>
        )}
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 items-center rounded-full transition-all duration-200 ${
          enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 shadow-md ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl">
      <div className="card-elevated p-6 bg-gradient-to-r from-primary-50 via-white to-primary-50 dark:from-primary-950/20 dark:via-gray-900 dark:to-primary-950/20">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <SettingsIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Settings
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Customize your meal planning experience
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* Appearance */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            {settings.darkMode ? (
              <Moon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            ) : (
              <Sun className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            )}
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          <ToggleSwitch
            enabled={settings.darkMode}
            onChange={() => updateSettings({ darkMode: !settings.darkMode })}
            label="Dark Mode"
            description="Toggle dark theme"
          />
        </div>

        {/* Voice Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Volume2 className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Voice</h2>
          </div>
          <div className="space-y-1">
            <ToggleSwitch
              enabled={settings.voiceEnabled}
              onChange={() => updateSettings({ voiceEnabled: !settings.voiceEnabled })}
              label="Voice Enabled"
              description="Enable text-to-speech"
            />
            {settings.voiceEnabled && (
              <>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <label className="block text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                    Voice Speed: <span className="text-primary-600 dark:text-primary-400">{settings.voiceSpeed.toFixed(1)}x</span>
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={settings.voiceSpeed}
                    onChange={(e) =>
                      updateSettings({ voiceSpeed: parseFloat(e.target.value) })
                    }
                    className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span>0.5x</span>
                    <span>1.0x</span>
                    <span>2.0x</span>
                  </div>
                </div>
                <ToggleSwitch
                  enabled={settings.autoReadResponses}
                  onChange={() => updateSettings({ autoReadResponses: !settings.autoReadResponses })}
                  label="Auto-Read Responses"
                  description="Automatically read AI responses aloud"
                />
              </>
            )}
          </div>
        </div>

        {/* Display Settings */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <ChefHat className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Display</h2>
          </div>
          <div className="space-y-1">
            <ToggleSwitch
              enabled={settings.emojisEnabled}
              onChange={() => updateSettings({ emojisEnabled: !settings.emojisEnabled })}
              label="Emojis"
              description="Show emojis in interface"
            />
            <ToggleSwitch
              enabled={settings.chefMode}
              onChange={() => updateSettings({ chefMode: !settings.chefMode })}
              label="Chef Mode"
              description="Clean recipe cards without emojis"
            />
          </div>
        </div>

        {/* Preferences */}
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-primary-600 dark:text-primary-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Language</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="input"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <ToggleSwitch
              enabled={settings.culturalAdaptation}
              onChange={() => updateSettings({ culturalAdaptation: !settings.culturalAdaptation })}
              label="Cultural Adaptation"
              description="Adapt meals to cultural preferences"
            />
            <ToggleSwitch
              enabled={settings.seasonalAdaptation}
              onChange={() => updateSettings({ seasonalAdaptation: !settings.seasonalAdaptation })}
              label="Seasonal Adaptation"
              description="Use seasonal ingredients"
            />
          </div>
        </div>

        {/* AI API Configuration */}
        <div className="card p-6 border-2 border-primary-200 dark:border-primary-900/30">
          <APIKeySettings />
        </div>

        {/* Email & SMTP Configuration */}
        <div className="card p-6">
          <SMTPSettings />
        </div>

        {/* Notification Preferences */}
        <div className="card p-6">
          <NotificationPreferences />
        </div>

        {/* Data Management */}
        <div className="card p-6 border-2 border-red-200 dark:border-red-900/30">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Data Management</h2>
          </div>
          <button
            onClick={handleClearData}
            className="btn bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Data
          </button>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">
            This will delete all your data including profiles, plans, and preferences. This action cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
}
