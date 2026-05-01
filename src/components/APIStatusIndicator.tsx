// API Status Indicator Component
import React, { useState, useEffect } from 'react';
import { Key, CheckCircle2, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function APIStatusIndicator() {
  const { settings } = useStore();
  const [isConfigured, setIsConfigured] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    try {
      // Check if AI service can be initialized
      const checkConfig = () => {
        // Check custom key first
        if (settings?.useCustomAPIKey && settings?.customOpenAIKey) {
          return true;
        }
        
        // Check default keys
        if (typeof window !== 'undefined' && window.APP_CONFIG) {
          return !!(window.APP_CONFIG.OPENAI_API_KEY || window.APP_CONFIG.ANTHROPIC_API_KEY);
        }
        
        // Check environment variables
        const env = import.meta.env as any;
        return !!(env.VITE_OPENAI_API_KEY || env.VITE_ANTHROPIC_API_KEY);
      };
      
      setIsConfigured(checkConfig());
    } catch (error) {
      setIsConfigured(false);
    }
  }, [settings.customOpenAIKey, settings.useCustomAPIKey]);

  const getStatusInfo = () => {
    if (!isConfigured) {
      return {
        status: 'not-configured',
        color: 'text-red-500',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
        borderColor: 'border-red-200 dark:border-red-800',
        icon: AlertCircle,
        text: 'No API Key',
        description: 'AI features require an API key. Add yours in Settings.',
      };
    }

    if (settings.useCustomAPIKey && settings.customOpenAIKey) {
      return {
        status: 'custom',
        color: 'text-green-500',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
        borderColor: 'border-green-200 dark:border-green-800',
        icon: CheckCircle2,
        text: 'Custom Key',
        description: 'Using your personal OpenAI API key',
      };
    }

    return {
      status: 'default',
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
      icon: CheckCircle2,
      text: 'Default Key',
      description: 'Using the default API key provided by the developer',
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo.icon;

  return (
    <div className="relative">
      {/* Status Badge */}
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium
          ${statusInfo.bgColor} ${statusInfo.color} ${statusInfo.borderColor}
          border transition-all duration-200 hover:shadow-md
        `}
      >
        <StatusIcon className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">{statusInfo.text}</span>
        <Info className="w-3 h-3 opacity-60" />
      </button>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-64 z-50 animate-scale-in">
          <div className={`
            rounded-xl shadow-xl border ${statusInfo.bgColor} ${statusInfo.borderColor}
            p-4 backdrop-blur-sm
          `}>
            <div className="flex items-start gap-3 mb-3">
              <StatusIcon className={`w-5 h-5 ${statusInfo.color} flex-shrink-0 mt-0.5`} />
              <div>
                <h4 className={`font-semibold ${statusInfo.color} mb-1`}>
                  {statusInfo.text}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {statusInfo.description}
                </p>
              </div>
            </div>

            {statusInfo.status === 'not-configured' && (
              <a
                href="#settings"
                onClick={(e) => {
                  e.preventDefault();
                  // Navigate to settings (you might want to use a proper navigation method)
                  window.location.hash = 'settings';
                }}
                className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
              >
                <Key className="w-3.5 h-3.5" />
                Configure API Key
              </a>
            )}

            {statusInfo.status === 'custom' && (
              <div className="flex items-center gap-2 text-xs text-green-700 dark:text-green-300">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Your key is working perfectly</span>
              </div>
            )}

            {statusInfo.status === 'default' && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-300">
                  <Info className="w-3.5 h-3.5" />
                  <span>Want more control? Add your own key!</span>
                </div>
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Get Your API Key
                </a>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

