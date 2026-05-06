/**
 * Vercel Serverless Function — Multi-Model AI Chat Proxy
 * 
 * Routes requests to the optimal AI provider based on task type:
 * 
 *  ┌─────────────────────────────────────────────────────────────┐
 *  │ Provider   │ Models                │ Best For               │
 *  ├────────────┼───────────────────────┼────────────────────────┤
 *  │ OpenAI     │ gpt-4o, gpt-4o-mini   │ General chat, labels   │
 *  │ Anthropic  │ claude-3.5-sonnet      │ Long analysis, safety  │
 *  │ OpenRouter │ google/gemma-3-27b-it  │ Meal plans, structured │
 *  │            │ meta-llama/llama-4-...  │ Complex reasoning      │
 *  │            │ mistralai/mistral-...   │ Fast responses         │
 *  │            │ google/gemini-2.5-...   │ Multimodal (images)    │
 *  └─────────────────────────────────────────────────────────────┘
 * 
 * POST /api/ai/chat
 * Body: { messages, model?, provider?, taskType? }
 * 
 * taskType routing:
 *  - "chat"           → gpt-4o (OpenAI) or claude-3.5-sonnet (Anthropic)
 *  - "meal_plan"      → google/gemma-3-27b-it (OpenRouter) — structured output
 *  - "label_analysis" → gpt-4o (OpenAI) — best at parsing ingredient lists
 *  - "fitness_coach"  → meta-llama/llama-4-scout (OpenRouter) — long context
 *  - "quick_tip"      → mistralai/mistral-small (OpenRouter) — fastest
 *  - "nutrition_qa"   → google/gemma-3-27b-it (OpenRouter) — safety-aligned
 */

export const config = {
  runtime: 'edge',
  maxDuration: 60,
};

// ─── Model Registry ────────────────────────────────────────────────────────────
// Each model entry defines the provider endpoint, model ID, and capabilities.

const MODEL_REGISTRY = {
  // ── OpenAI ────────────────────────────
  'gpt-4o': {
    provider: 'openai',
    model: 'gpt-4o',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4096,
    strengths: ['general chat', 'label analysis', 'code', 'image understanding'],
    costTier: 'medium',
  },
  'gpt-4o-mini': {
    provider: 'openai',
    model: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    maxTokens: 4096,
    strengths: ['quick responses', 'simple queries', 'cost-effective'],
    costTier: 'low',
  },

  // ── Anthropic ─────────────────────────
  'claude-3.5-sonnet': {
    provider: 'anthropic',
    model: 'claude-3-5-sonnet-20241022',
    endpoint: 'https://api.anthropic.com/v1/messages',
    maxTokens: 4096,
    strengths: ['long analysis', 'safety', 'nuanced advice', 'detailed meal plans'],
    costTier: 'medium',
  },

  // ── OpenRouter Models ─────────────────
  // Google Gemma 3 — excellent for structured health Q&A, safety-aligned
  'gemma-3-27b': {
    provider: 'openrouter',
    model: 'google/gemma-3-27b-it',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 4096,
    strengths: ['nutrition Q&A', 'structured output', 'safety', 'meal planning'],
    costTier: 'low',
  },

  // Meta Llama 4 Scout — massive context for complex reasoning
  'llama-4-scout': {
    provider: 'openrouter',
    model: 'meta-llama/llama-4-scout',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 4096,
    strengths: ['complex reasoning', 'fitness coaching', 'long context', 'research'],
    costTier: 'medium',
  },

  // Mistral Small — ultra-fast for quick tips and simple queries
  'mistral-small': {
    provider: 'openrouter',
    model: 'mistralai/mistral-small-2503',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 2048,
    strengths: ['speed', 'quick tips', 'simple Q&A', 'cost-effective'],
    costTier: 'low',
  },

  // Google Gemini 2.5 Flash — best multimodal (label images)
  'gemini-2.5-flash': {
    provider: 'openrouter',
    model: 'google/gemini-2.5-flash-preview',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 4096,
    strengths: ['multimodal', 'image analysis', 'label scanning', 'speed'],
    costTier: 'low',
  },

  // DeepSeek V3 — strong reasoning at very low cost
  'deepseek-v3': {
    provider: 'openrouter',
    model: 'deepseek/deepseek-chat-v3-0324',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 4096,
    strengths: ['reasoning', 'math', 'science', 'cost-effective'],
    costTier: 'low',
  },
};

// ─── Task-to-Model Routing ─────────────────────────────────────────────────────
// Maps task types to the best model for the job, with fallback chains.

const TASK_ROUTES = {
  chat:                ['gpt-4o', 'claude-3.5-sonnet', 'gemma-3-27b', 'llama-4-scout'],
  meal_plan:           ['gemma-3-27b', 'claude-3.5-sonnet', 'gpt-4o', 'llama-4-scout'],
  label_analysis:      ['gpt-4o', 'gemini-2.5-flash', 'claude-3.5-sonnet', 'gemma-3-27b'],
  fitness_coach:       ['llama-4-scout', 'claude-3.5-sonnet', 'gpt-4o', 'gemma-3-27b'],
  quick_tip:           ['mistral-small', 'gpt-4o-mini', 'gemma-3-27b', 'gpt-4o'],
  nutrition_qa:        ['gemma-3-27b', 'gpt-4o', 'claude-3.5-sonnet', 'llama-4-scout'],
  grocery:             ['mistral-small', 'gemma-3-27b', 'gpt-4o-mini', 'gpt-4o'],
  recipe:              ['gemma-3-27b', 'claude-3.5-sonnet', 'gpt-4o', 'llama-4-scout'],
  // New task types for supplement intelligence
  supplement_research: ['deepseek-v3', 'llama-4-scout', 'claude-3.5-sonnet', 'gpt-4o'],
  blood_work_analysis: ['claude-3.5-sonnet', 'gpt-4o', 'deepseek-v3', 'gemma-3-27b'],
  interaction_check:   ['gpt-4o', 'claude-3.5-sonnet', 'deepseek-v3', 'gemma-3-27b'],
};

// ─── Handler ───────────────────────────────────────────────────────────────────

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }
  if (req.method !== 'POST') {
    return jsonResponse({ success: false, error: 'Method not allowed' }, 405);
  }

  try {
    const body = await req.json();
    const { messages, model: requestedModel, provider: requestedProvider, taskType } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return jsonResponse({ success: false, error: 'Messages array is required' }, 400);
    }

    // Resolve which model to use
    const resolvedModel = resolveModel(requestedModel, requestedProvider, taskType);
    if (!resolvedModel) {
      return jsonResponse({
        success: false,
        error: 'No AI provider is configured. Please add API keys in Vercel environment variables.',
        availableProviders: getAvailableProviders(),
      }, 503);
    }

    // Execute with fallback chain
    const route = TASK_ROUTES[taskType] || TASK_ROUTES.chat;
    const result = await executeWithFallback(messages, resolvedModel, route);

    return jsonResponse({
      success: true,
      data: {
        content: result.content,
        provider: result.provider,
        model: result.model,
      },
    });
  } catch (error) {
    console.error('[AI Proxy Error]', error);
    return jsonResponse({
      success: false,
      error: error.userMessage || error.message || 'Internal server error',
    }, error.status || 500);
  }
}

// ─── Model Resolution ──────────────────────────────────────────────────────────

function resolveModel(requestedModel, requestedProvider, taskType) {
  // 1. If a specific model was requested, use it (if available)
  if (requestedModel && MODEL_REGISTRY[requestedModel]) {
    const entry = MODEL_REGISTRY[requestedModel];
    if (hasKeyForProvider(entry.provider)) {
      return requestedModel;
    }
  }

  // 2. Use task-based routing
  const route = TASK_ROUTES[taskType] || TASK_ROUTES.chat;
  for (const modelId of route) {
    const entry = MODEL_REGISTRY[modelId];
    if (entry && hasKeyForProvider(entry.provider)) {
      return modelId;
    }
  }

  return null;
}

function hasKeyForProvider(provider) {
  switch (provider) {
    case 'openai': return !!process.env.OPENAI_API_KEY;
    case 'anthropic': return !!process.env.ANTHROPIC_API_KEY;
    case 'openrouter': return !!process.env.OPENROUTER_API_KEY;
    default: return false;
  }
}

function getAvailableProviders() {
  const providers = [];
  if (process.env.OPENAI_API_KEY) providers.push('openai');
  if (process.env.ANTHROPIC_API_KEY) providers.push('anthropic');
  if (process.env.OPENROUTER_API_KEY) providers.push('openrouter');
  return providers;
}

// ─── Execute with Fallback ─────────────────────────────────────────────────────

async function executeWithFallback(messages, primaryModelId, fallbackChain) {
  const tried = new Set();
  const errors = [];

  // Try primary first
  const modelsToTry = [primaryModelId, ...fallbackChain.filter(m => m !== primaryModelId)];

  for (const modelId of modelsToTry) {
    if (tried.has(modelId)) continue;
    tried.add(modelId);

    const entry = MODEL_REGISTRY[modelId];
    if (!entry || !hasKeyForProvider(entry.provider)) continue;

    try {
      return await callModel(messages, entry);
    } catch (err) {
      console.warn(`[AI Proxy] ${modelId} failed:`, err.message);
      errors.push({ model: modelId, error: err.message });

      // Don't retry on auth errors
      if (err.status === 401 || err.status === 403) continue;
      // Don't retry on rate limits for the same provider
      if (err.status === 429) continue;
    }
  }

  const err = new Error(`All AI providers failed. Tried: ${Array.from(tried).join(', ')}`);
  err.status = 503;
  err.userMessage = 'All AI providers are temporarily unavailable. Please try again later.';
  throw err;
}

// ─── Provider Callers ──────────────────────────────────────────────────────────

async function callModel(messages, entry) {
  switch (entry.provider) {
    case 'openai':
      return callOpenAI(messages, entry);
    case 'anthropic':
      return callAnthropic(messages, entry);
    case 'openrouter':
      return callOpenRouter(messages, entry);
    default:
      throw new Error(`Unknown provider: ${entry.provider}`);
  }
}

async function callOpenAI(messages, entry) {
  const response = await fetch(entry.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: entry.model,
      messages,
      max_tokens: entry.maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throwProviderError(response.status, data, 'OpenAI', entry.model);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openai',
    model: entry.model,
  };
}

async function callAnthropic(messages, entry) {
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');
  const system = systemMessages.map(m => m.content).join('\n') || undefined;

  const response = await fetch(entry.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: entry.model,
      max_tokens: entry.maxTokens,
      temperature: 0.7,
      system,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throwProviderError(response.status, data, 'Anthropic', entry.model);
  }

  const data = await response.json();
  return {
    content: data.content[0].text,
    provider: 'anthropic',
    model: entry.model,
  };
}

async function callOpenRouter(messages, entry) {
  const response = await fetch(entry.endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'https://mealplanner-ai-alpha.vercel.app',
      'X-Title': 'Meal Plan Assistant — Nourish AI',
    },
    body: JSON.stringify({
      model: entry.model,
      messages,
      max_tokens: entry.maxTokens,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throwProviderError(response.status, data, `OpenRouter/${entry.model}`, entry.model);
  }

  const data = await response.json();
  return {
    content: data.choices[0].message.content,
    provider: 'openrouter',
    model: entry.model,
  };
}

// ─── Error Handling ────────────────────────────────────────────────────────────

function throwProviderError(status, data, providerName, model) {
  const message = data?.error?.message || data?.error || `${providerName} error: ${status}`;
  const err = new Error(message);
  err.status = status;

  if (status === 429 || message.includes('quota') || message.includes('billing') || message.includes('insufficient')) {
    err.userMessage = `${providerName} quota exceeded. Trying alternative provider...`;
  } else if (status === 401 || status === 403) {
    err.userMessage = `${providerName} API key is invalid.`;
  } else if (status === 400 || status === 422) {
    err.userMessage = 'Invalid request. Please try rephrasing your question.';
  } else {
    err.userMessage = `${providerName} error. Trying alternative...`;
  }

  throw err;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders() },
  });
}
