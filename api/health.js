/**
 * Vercel Serverless Function — API Health Check
 * 
 * GET /api/health
 * Returns server status, available AI providers, and integration capabilities
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
      'gemma-3-27b',
      'llama-4-scout',
      'mistral-small',
      'gemini-2.5-flash',
      'deepseek-v3',
    );
  }

  // Data integrations
  const integrations = {
    usda: !!process.env.USDA_API_KEY,
    openFoodFacts: true, // Always available (no key needed)
    pubmed: true, // Always available (free, no key required)
    biomarkerDb: true, // Built-in database
  };

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
      integrations,
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
