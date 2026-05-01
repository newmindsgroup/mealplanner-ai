/// <reference types="../vite-env" />

/**
 * AI Service - Supports both OpenAI and Anthropic APIs with advanced error handling
 */

export type AIProvider = 'openai' | 'anthropic';

export enum AIErrorType {
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  AUTH_ERROR = 'AUTH_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_REQUEST = 'INVALID_REQUEST',
  UNKNOWN = 'UNKNOWN',
}

export class AIError extends Error {
  constructor(
    public type: AIErrorType,
    public userMessage: string,
    public technicalMessage: string,
    public isRetryable: boolean = false,
    public provider?: AIProvider
  ) {
    super(technicalMessage);
    this.name = 'AIError';
  }
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatCompletionOptions {
  temperature?: number;
  maxTokens?: number;
  model?: string;
  skipRetry?: boolean;
}

class AIService {
  private provider: AIProvider;
  private apiKey: string;
  private baseURL: string;
  private alternativeProvider: AIProvider | null = null;
  private alternativeApiKey: string | null = null;
  private alternativeBaseURL: string | null = null;
  private maxRetries = 3;
  private retryDelays = [1000, 2000, 4000]; // Exponential backoff

  constructor() {
    // Get configuration from runtime config (supports both .env and config.js)
    let openaiKey: string | undefined;
    let anthropicKey: string | undefined;
    
    // 1. First, check for user's custom API key in settings
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedState = localStorage.getItem('meal-plan-store');
        if (storedState) {
          const state = JSON.parse(storedState);
          const settings = state?.state?.settings;
          
          // If user has a custom OpenAI key and wants to use it
          if (settings?.useCustomAPIKey && settings?.customOpenAIKey) {
            // Import decrypt function dynamically to avoid circular dependencies
            const { decryptString } = require('../utils/emailEncryption');
            const customKey = decryptString(settings.customOpenAIKey);
            if (customKey && customKey.startsWith('sk-')) {
              openaiKey = customKey;
              console.log('✅ Using custom OpenAI API key from settings');
            }
          }
        }
      }
    } catch (error) {
      console.warn('Could not load custom API key from settings:', error);
    }
    
    // 2. Check window.APP_CONFIG (for production/cPanel default keys)
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
      if (!openaiKey) openaiKey = window.APP_CONFIG.OPENAI_API_KEY;
      if (!anthropicKey) anthropicKey = window.APP_CONFIG.ANTHROPIC_API_KEY;
    }
    
    // 3. Fallback to environment variables (for development)
    if (!openaiKey) openaiKey = (import.meta.env as any).VITE_OPENAI_API_KEY;
    if (!anthropicKey) anthropicKey = (import.meta.env as any).VITE_ANTHROPIC_API_KEY;

    // Set primary provider
    if (anthropicKey) {
      this.provider = 'anthropic';
      this.apiKey = anthropicKey;
      this.baseURL = 'https://api.anthropic.com/v1';
      
      // Set OpenAI as fallback if available
      if (openaiKey) {
        this.alternativeProvider = 'openai';
        this.alternativeApiKey = openaiKey;
        this.alternativeBaseURL = 'https://api.openai.com/v1';
      }
    } else if (openaiKey) {
      this.provider = 'openai';
      this.apiKey = openaiKey;
      this.baseURL = 'https://api.openai.com/v1';
    } else {
      throw new Error('No API key found. Please configure your API key:\n- Add your own OpenAI API key in Settings\n- For development: Set VITE_OPENAI_API_KEY in .env file\n- For production: Create config.js with your API key (see config.example.js)');
    }
  }

  /**
   * Check if API is configured
   */
  static isConfigured(): boolean {
    // 1. Check for custom user API key in settings
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const storedState = localStorage.getItem('meal-plan-store');
        if (storedState) {
          const state = JSON.parse(storedState);
          const settings = state?.state?.settings;
          if (settings?.useCustomAPIKey && settings?.customOpenAIKey) {
            return true;
          }
        }
      }
    } catch (error) {
      // Continue to check other sources
    }
    
    // 2. Check window.APP_CONFIG (production/cPanel)
    if (typeof window !== 'undefined' && window.APP_CONFIG) {
      return !!(
        window.APP_CONFIG.OPENAI_API_KEY ||
        window.APP_CONFIG.ANTHROPIC_API_KEY
      );
    }
    // 3. Check environment variables (development)
    const env = import.meta.env as any;
    return !!(
      env.VITE_OPENAI_API_KEY ||
      env.VITE_ANTHROPIC_API_KEY
    );
  }

  /**
   * Get current provider
   */
  getProvider(): AIProvider {
    return this.provider;
  }

  /**
   * Classify error based on response status and message
   */
  private classifyError(status: number, errorData: any, provider: AIProvider): AIError {
    const message = errorData?.error?.message || errorData?.message || 'Unknown error';
    
    // Quota exceeded errors
    if (
      status === 429 ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('insufficient_quota') ||
      message.toLowerCase().includes('billing')
    ) {
      return new AIError(
        AIErrorType.QUOTA_EXCEEDED,
        `I've reached my API usage limit. Please check your ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} account billing at ${
          provider === 'openai' 
            ? 'https://platform.openai.com/account/billing' 
            : 'https://console.anthropic.com/settings/billing'
        }`,
        message,
        false,
        provider
      );
    }

    // Authentication errors
    if (
      status === 401 ||
      message.toLowerCase().includes('invalid api key') ||
      message.toLowerCase().includes('authentication')
    ) {
      return new AIError(
        AIErrorType.AUTH_ERROR,
        'There\'s an issue with the API key configuration. Please check your API key settings.',
        message,
        false,
        provider
      );
    }

    // Rate limit errors (different from quota)
    if (
      status === 429 && 
      (message.toLowerCase().includes('rate') || message.toLowerCase().includes('too many requests'))
    ) {
      return new AIError(
        AIErrorType.RATE_LIMIT,
        'I\'m receiving too many requests right now. Please wait a moment and try again.',
        message,
        true,
        provider
      );
    }

    // Network errors
    if (status === 0 || status === 503 || status === 504) {
      return new AIError(
        AIErrorType.NETWORK_ERROR,
        'I\'m having trouble connecting to the AI service. Please check your internet connection and try again.',
        message,
        true,
        provider
      );
    }

    // Invalid request errors
    if (status === 400 || status === 422) {
      return new AIError(
        AIErrorType.INVALID_REQUEST,
        'There was an issue with the request. Please try rephrasing your question.',
        message,
        false,
        provider
      );
    }

    // Unknown errors
    return new AIError(
      AIErrorType.UNKNOWN,
      'I encountered an unexpected error. Please try again in a moment.',
      message,
      true,
      provider
    );
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Retry logic wrapper
   */
  private async retryWithBackoff<T>(
    operation: () => Promise<T>,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: AIError | null = null;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (error instanceof AIError) {
          lastError = error;
          
          // Don't retry non-retryable errors
          if (!error.isRetryable || attempt === this.maxRetries) {
            throw error;
          }

          // Log retry attempt
          console.log(`[AIService] Retry ${attempt + 1}/${this.maxRetries} for ${operationName} after ${this.retryDelays[attempt]}ms`);
          
          // Wait before retrying
          await this.sleep(this.retryDelays[attempt]);
        } else {
          // Unknown error, wrap it
          throw new AIError(
            AIErrorType.UNKNOWN,
            'An unexpected error occurred. Please try again.',
            error instanceof Error ? error.message : String(error),
            false
          );
        }
      }
    }

    // This should never be reached, but TypeScript needs it
    throw lastError || new AIError(
      AIErrorType.UNKNOWN,
      'Operation failed after multiple retries.',
      'Max retries exceeded',
      false
    );
  }

  /**
   * Switch to alternative provider
   */
  private switchToAlternativeProvider(): boolean {
    if (this.alternativeProvider && this.alternativeApiKey && this.alternativeBaseURL) {
      console.log(`[AIService] Switching from ${this.provider} to ${this.alternativeProvider}`);
      
      // Swap providers
      const tempProvider = this.provider;
      const tempKey = this.apiKey;
      const tempURL = this.baseURL;
      
      this.provider = this.alternativeProvider;
      this.apiKey = this.alternativeApiKey;
      this.baseURL = this.alternativeBaseURL;
      
      this.alternativeProvider = tempProvider;
      this.alternativeApiKey = tempKey;
      this.alternativeBaseURL = tempURL;
      
      return true;
    }
    return false;
  }

  /**
   * Chat completion - works with both providers, includes retry logic and fallback
   */
  async chat(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const skipRetry = options.skipRetry || false;

    const performChat = async (): Promise<string> => {
      try {
        if (this.provider === 'anthropic') {
          return await this.chatAnthropic(messages, options);
        } else {
          return await this.chatOpenAI(messages, options);
        }
      } catch (error) {
        // If it's an AIError, just throw it
        if (error instanceof AIError) {
          throw error;
        }
        // Otherwise, wrap it
        throw new AIError(
          AIErrorType.UNKNOWN,
          'An unexpected error occurred while communicating with the AI.',
          error instanceof Error ? error.message : String(error),
          false,
          this.provider
        );
      }
    };

    try {
      // Try with retry logic if enabled
      if (skipRetry) {
        return await performChat();
      } else {
        return await this.retryWithBackoff(performChat, 'chat');
      }
    } catch (error) {
      if (error instanceof AIError) {
        // If quota exceeded and we have an alternative provider, try switching
        if (
          error.type === AIErrorType.QUOTA_EXCEEDED &&
          this.alternativeProvider
        ) {
          console.log(`[AIService] Quota exceeded on ${error.provider}, attempting fallback to ${this.alternativeProvider}`);
          
          if (this.switchToAlternativeProvider()) {
            try {
              // Try with the alternative provider
              return await this.retryWithBackoff(performChat, 'chat-fallback');
            } catch (fallbackError) {
              // Both providers failed
              if (fallbackError instanceof AIError) {
                throw new AIError(
                  AIErrorType.QUOTA_EXCEEDED,
                  'Both OpenAI and Anthropic services are currently unavailable. Please check your API quotas and try again later.',
                  `Primary: ${error.technicalMessage}, Fallback: ${fallbackError.technicalMessage}`,
                  false
                );
              }
              throw fallbackError;
            }
          }
        }
        
        throw error;
      }
      
      // Unknown error type
      throw new AIError(
        AIErrorType.UNKNOWN,
        'An unexpected error occurred. Please try again.',
        error instanceof Error ? error.message : String(error),
        false
      );
    }
  }

  /**
   * Anthropic Claude API
   */
  private async chatAnthropic(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const model = options.model || 'claude-3-5-sonnet-20241022';
    const maxTokens = options.maxTokens || 4096;
    const temperature = options.temperature ?? 0.7;

    // Anthropic requires system message to be separate
    const systemMessages = messages.filter((m) => m.role === 'system');
    const conversationMessages = messages.filter((m) => m.role !== 'system');
    const system = systemMessages.map((m) => m.content).join('\n') || undefined;

    const response = await fetch(`${this.baseURL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature,
        system,
        messages: conversationMessages.map((msg) => ({
          role: msg.role === 'assistant' ? 'assistant' : 'user',
          content: msg.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { message: `API error: ${response.statusText}` } 
      }));
      throw this.classifyError(response.status, errorData, 'anthropic');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  /**
   * OpenAI API
   */
  private async chatOpenAI(
    messages: ChatMessage[],
    options: ChatCompletionOptions = {}
  ): Promise<string> {
    const model = options.model || 'gpt-4-turbo-preview';
    const maxTokens = options.maxTokens || 2000;
    const temperature = options.temperature ?? 0.7;

    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: maxTokens,
        temperature,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ 
        error: { message: `API error: ${response.statusText}` } 
      }));
      throw this.classifyError(response.status, errorData, 'openai');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  /**
   * Generate structured JSON response
   */
  async generateJSON<T>(
    prompt: string,
    schema: object,
    options: ChatCompletionOptions = {}
  ): Promise<T> {
    const systemPrompt = `You are a helpful assistant that generates valid JSON responses.
Return ONLY valid JSON that matches the requested schema. Do not include any markdown formatting or code blocks.
Schema: ${JSON.stringify(schema, null, 2)}`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ];

    const response = await this.chat(messages, {
      ...options,
      temperature: 0.3, // Lower temperature for more consistent JSON
    });

    // Try to extract JSON from response (in case it's wrapped in markdown)
    let jsonString = response.trim();
    if (jsonString.startsWith('```json')) {
      jsonString = jsonString.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonString.startsWith('```')) {
      jsonString = jsonString.replace(/^```\n?/, '').replace(/\n?```$/, '');
    }

    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.error('Failed to parse JSON response:', jsonString);
      throw new AIError(
        AIErrorType.INVALID_REQUEST,
        'I had trouble formatting the response correctly. Please try again.',
        'Invalid JSON response from AI',
        false,
        this.provider
      );
    }
  }
}

// Export singleton instance
let aiServiceInstance: AIService | null = null;

export function getAIService(): AIService | null {
  if (!AIService.isConfigured()) {
    return null;
  }

  if (!aiServiceInstance) {
    try {
      aiServiceInstance = new AIService();
    } catch (error) {
      console.error('Failed to initialize AI service:', error);
      return null;
    }
  }

  return aiServiceInstance;
}

export default AIService;
