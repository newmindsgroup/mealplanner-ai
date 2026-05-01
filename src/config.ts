// Runtime configuration for production
// This allows API keys and endpoints to be configured without rebuilding

declare global {
  interface Window {
    APP_CONFIG?: {
      API_URL?: string;
      OPENAI_API_KEY?: string;
      ANTHROPIC_API_KEY?: string;
    };
  }
}

export function getConfig() {
  // In production, check window.APP_CONFIG first (from config.js)
  if (typeof window !== 'undefined' && window.APP_CONFIG) {
    return {
      apiUrl: window.APP_CONFIG.API_URL,
      openaiKey: window.APP_CONFIG.OPENAI_API_KEY,
      anthropicKey: window.APP_CONFIG.ANTHROPIC_API_KEY,
    };
  }

  // Fallback to environment variables (for development)
  return {
    apiUrl: import.meta.env.VITE_API_URL || '/api',
    openaiKey: import.meta.env.VITE_OPENAI_API_KEY,
    anthropicKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  };
}

// Get API URL helper
export function getApiUrl(): string {
  const config = getConfig();
  return config.apiUrl || '/api';
}

