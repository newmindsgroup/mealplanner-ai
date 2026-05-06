/**
 * Vercel Serverless Function — API Health Check
 * 
 * GET /api/health
 * Returns server status and available AI providers
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasAnthropic = !!process.env.ANTHROPIC_API_KEY;

  return new Response(
    JSON.stringify({
      success: true,
      message: 'Meal Plan Assistant API is running',
      timestamp: new Date().toISOString(),
      ai: {
        openai: hasOpenAI,
        anthropic: hasAnthropic,
        available: hasOpenAI || hasAnthropic,
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
