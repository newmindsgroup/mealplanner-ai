/**
 * Vercel Serverless Function — API Health Check
 * 
 * GET /api/health
 * Returns server status, available AI providers, and model registry
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const providers = {
    openai: !!process.env.OPENAI_API_KEY,
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
  };

  const available = Object.values(providers).some(Boolean);

  // Models available based on configured providers
  const models = [];
  if (providers.openai) models.push('gpt-4o', 'gpt-4o-mini');
  if (providers.anthropic) models.push('claude-3.5-sonnet');
  if (providers.openrouter) {
    models.push(
      'gemma-3-27b',       // Google Gemma 3
      'llama-4-scout',     // Meta Llama 4
      'mistral-small',     // Mistral AI
      'gemini-2.5-flash',  // Google Gemini
      'deepseek-v3',       // DeepSeek
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Meal Plan Assistant API is running',
      timestamp: new Date().toISOString(),
      ai: {
        ...providers,
        available,
        modelCount: models.length,
        models,
      },
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
    }
  );
}
