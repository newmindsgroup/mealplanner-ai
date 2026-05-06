/**
 * Vercel Serverless Function — AI Chat Proxy
 * 
 * Securely proxies chat requests to OpenAI/Anthropic without exposing
 * API keys to the browser. The key stays server-side in Vercel env vars.
 * 
 * POST /api/ai/chat
 * Body: { messages: ChatMessage[], model?: string, provider?: string }
 * Returns: { success: true, data: { content: string, provider: string } }
 */

export const config = {
  runtime: 'edge',
  // Increase timeout for AI responses
  maxDuration: 30,
};

export default async function handler(req) {
  // Only allow POST
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ success: false, error: 'Method not allowed' }),
      { status: 405, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { messages, model, provider: requestedProvider } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Messages array is required' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Check available API keys from Vercel environment
    const openaiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;

    if (!openaiKey && !anthropicKey) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'No AI API key configured. Please add OPENAI_API_KEY or ANTHROPIC_API_KEY to Vercel environment variables.',
        }),
        { status: 503, headers: corsHeaders }
      );
    }

    // Determine provider
    let provider = requestedProvider || (anthropicKey ? 'anthropic' : 'openai');
    
    let content;
    let usedProvider;

    if (provider === 'anthropic' && anthropicKey) {
      const result = await callAnthropic(messages, anthropicKey, model);
      content = result.content;
      usedProvider = 'anthropic';
    } else if (openaiKey) {
      const result = await callOpenAI(messages, openaiKey, model);
      content = result.content;
      usedProvider = 'openai';
    } else if (anthropicKey) {
      // Fallback
      const result = await callAnthropic(messages, anthropicKey, model);
      content = result.content;
      usedProvider = 'anthropic';
    } else {
      return new Response(
        JSON.stringify({ success: false, error: 'No matching API key for requested provider' }),
        { status: 503, headers: corsHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, data: { content, provider: usedProvider } }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error('[AI Chat Proxy Error]', error);

    const status = error.status || 500;
    const message = error.userMessage || error.message || 'Internal server error';

    return new Response(
      JSON.stringify({ success: false, error: message }),
      { status, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

// ─── OpenAI ────────────────────────────────────────────────────────────────────

async function callOpenAI(messages, apiKey, model) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'gpt-4o',
      messages,
      max_tokens: 2000,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData?.error?.message || `OpenAI error: ${response.status}`);
    err.status = response.status;
    err.userMessage = classifyError(response.status, errorData, 'OpenAI');
    throw err;
  }

  const data = await response.json();
  return { content: data.choices[0].message.content };
}

// ─── Anthropic ─────────────────────────────────────────────────────────────────

async function callAnthropic(messages, apiKey, model) {
  // Separate system messages
  const systemMessages = messages.filter(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');
  const system = systemMessages.map(m => m.content).join('\n') || undefined;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: 4096,
      temperature: 0.7,
      system,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const err = new Error(errorData?.error?.message || `Anthropic error: ${response.status}`);
    err.status = response.status;
    err.userMessage = classifyError(response.status, errorData, 'Anthropic');
    throw err;
  }

  const data = await response.json();
  return { content: data.content[0].text };
}

// ─── Error Classification ──────────────────────────────────────────────────────

function classifyError(status, errorData, provider) {
  const message = errorData?.error?.message || '';

  if (status === 429 || message.includes('quota') || message.includes('billing')) {
    return `${provider} API quota exceeded. Please check your billing.`;
  }
  if (status === 401) {
    return `${provider} API key is invalid. Please check your configuration.`;
  }
  if (status === 400 || status === 422) {
    return 'Invalid request. Please try rephrasing your question.';
  }
  return `${provider} service error. Please try again.`;
}
