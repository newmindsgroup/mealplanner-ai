// API Key Settings Component
import React, { useState } from 'react';
import { Key, CheckCircle2, XCircle, Loader, Eye, EyeOff, AlertCircle, Info } from 'lucide-react';
import { useStore } from '../store/useStore';
import { encryptString, decryptString } from '../utils/emailEncryption';
import { getAIService } from '../services/aiService';

export default function APIKeySettings() {
  const { settings, updateSettings } = useStore();
  const [showKey, setShowKey] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Decrypt existing key for display
  const hasCustomKey = !!settings.customOpenAIKey;
  const decryptedKey = hasCustomKey && settings.customOpenAIKey 
    ? decryptString(settings.customOpenAIKey) 
    : '';

  const handleToggleCustomKey = (enabled: boolean) => {
    updateSettings({ useCustomAPIKey: enabled });
    setTestResult(null);
  };

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setIsSaving(true);
    try {
      // Encrypt the API key before saving
      const encryptedKey = encryptString(apiKey);
      updateSettings({
        customOpenAIKey: encryptedKey,
        useCustomAPIKey: true,
      });

      setTestResult({ 
        success: true, 
        message: 'API key saved successfully! Click "Test Connection" to verify it works.' 
      });
      setApiKey(''); // Clear input after saving
    } catch (error) {
      console.error('Error saving API key:', error);
      setTestResult({ 
        success: false, 
        message: 'Failed to save API key. Please try again.' 
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.customOpenAIKey) {
      setTestResult({ success: false, message: 'Please save an API key first' });
      return;
    }

    setIsTestingKey(true);
    setTestResult(null);

    try {
      // Create a temporary AI service instance with the custom key
      const testKey = decryptString(settings.customOpenAIKey);
      
      // Make a simple test request
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${testKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      });

      if (response.ok) {
        setTestResult({
          success: true,
          message: '✅ Connection successful! Your API key is working correctly.',
        });
      } else {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || response.statusText;
        
        setTestResult({
          success: false,
          message: `❌ Connection failed: ${errorMessage}`,
        });
      }
    } catch (error) {
      console.error('API test error:', error);
      setTestResult({
        success: false,
        message: '❌ Failed to test connection. Please check your API key and internet connection.',
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleRemoveKey = () => {
    if (confirm('Are you sure you want to remove your custom API key? The app will use the default key.')) {
      updateSettings({
        customOpenAIKey: undefined,
        useCustomAPIKey: false,
      });
      setApiKey('');
      setTestResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
          <Key className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          OpenAI API Configuration
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Add your own OpenAI API key or use the default one provided.
        </p>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-800 dark:text-blue-200">
            <p className="font-semibold mb-1">Why add your own API key?</p>
            <ul className="space-y-1 ml-4 list-disc">
              <li>You have more control over usage and billing</li>
              <li>No rate limits from shared keys</li>
              <li>You can use your own OpenAI subscription benefits</li>
              <li>Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">platform.openai.com</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Current Status */}
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Current API Configuration
          </span>
          <span className={`text-xs px-2 py-1 rounded-full ${
            hasCustomKey && settings.useCustomAPIKey
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
          }`}>
            {hasCustomKey && settings.useCustomAPIKey ? 'Using Custom Key' : 'Using Default Key'}
          </span>
        </div>

        {hasCustomKey && (
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <CheckCircle2 className="w-4 h-4 text-green-500" />
            <span>Custom API key configured</span>
          </div>
        )}
      </div>

      {/* Toggle Custom Key Usage */}
      {hasCustomKey && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div>
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              Use Custom API Key
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Toggle between your custom key and the default key
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.useCustomAPIKey || false}
              onChange={(e) => handleToggleCustomKey(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
          </label>
        </div>
      )}

      {/* Add/Update API Key */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {hasCustomKey ? 'Update API Key' : 'Add Your OpenAI API Key'}
          </label>
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setTestResult(null);
              }}
              placeholder={hasCustomKey ? 'Enter new API key to update' : 'sk-...'}
              className="w-full px-4 py-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-white placeholder-gray-400"
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Your API key is encrypted and stored securely in your browser
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleSaveKey}
            disabled={!apiKey.trim() || isSaving}
            className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Key className="w-4 h-4" />
                {hasCustomKey ? 'Update Key' : 'Save Key'}
              </>
            )}
          </button>

          {hasCustomKey && (
            <>
              <button
                onClick={handleTestConnection}
                disabled={isTestingKey}
                className="flex-1 btn-secondary"
              >
                {isTestingKey ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Test Connection
                  </>
                )}
              </button>

              <button
                onClick={handleRemoveKey}
                className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors border border-red-200 dark:border-red-800"
                title="Remove custom key"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Test Result */}
      {testResult && (
        <div className={`p-4 rounded-xl border ${
          testResult.success
            ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
        }`}>
          <div className="flex items-start gap-3">
            {testResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              testResult.success
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}>
              {testResult.message}
            </p>
          </div>
        </div>
      )}

      {/* Current Key Display (if exists) */}
      {hasCustomKey && (
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
            Current Stored Key
          </label>
          <div className="font-mono text-sm text-gray-900 dark:text-white break-all">
            {showKey ? decryptedKey : '••••••••••••••••••••••••••••••••••••••••••'}
          </div>
        </div>
      )}

      {/* Help Text */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>💡 <strong>Tip:</strong> If you don't have an API key, the app will use the default key provided by the developer.</p>
        <p>🔒 <strong>Security:</strong> Your API key is encrypted and only stored in your browser. It never leaves your device.</p>
        <p>📊 <strong>Usage:</strong> You can monitor your API usage in your OpenAI dashboard.</p>
      </div>
    </div>
  );
}

