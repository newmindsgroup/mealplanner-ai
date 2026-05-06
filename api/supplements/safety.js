/**
 * Vercel Serverless Function — OpenFDA Supplement Safety Proxy
 * 
 * Searches FDA CAERS database for adverse event reports on supplements.
 * 100% free, no API key required for basic use.
 * 
 * GET /api/supplements/safety?q=ashwagandha&limit=5
 */

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '5'), 10);

  if (!query) {
    return jsonResponse({ success: false, error: 'Query parameter "q" is required' }, 400);
  }

  try {
    // Search CAERS (supplement adverse events)
    const fdaUrl = `https://api.fda.gov/food/event.json?search=products.name_brand:"${encodeURIComponent(query)}"+products.industry_name:"dietary+supplement"&limit=${limit}`;

    const response = await fetch(fdaUrl, {
      headers: { 'User-Agent': 'MealPlanAssistant/1.0' },
    });

    if (!response.ok) {
      // Try broader search
      const fallbackUrl = `https://api.fda.gov/food/event.json?search="${encodeURIComponent(query)}"+AND+products.industry_code:54&limit=${limit}`;
      const fallbackResp = await fetch(fallbackUrl);

      if (!fallbackResp.ok) {
        return jsonResponse({
          success: true,
          data: [],
          message: 'No adverse event reports found for this supplement',
          safetyNote: 'No FDA adverse events reported does NOT mean a supplement is safe. Always consult your healthcare provider.',
        });
      }

      const fallbackData = await fallbackResp.json();
      return formatSafetyResponse(fallbackData, query);
    }

    const data = await response.json();
    return formatSafetyResponse(data, query);
  } catch (error) {
    console.error('[FDA Safety Proxy Error]', error);
    return jsonResponse({
      success: true,
      data: [],
      message: 'Unable to fetch FDA data — supplement safety check unavailable',
      safetyNote: 'Always consult your healthcare provider before starting any supplement.',
    });
  }
}

function formatSafetyResponse(data, query) {
  const events = (data.results || []).map(event => ({
    date: event.date_started || event.date_created || null,
    reactions: event.reactions || [],
    outcomes: event.outcomes || [],
    products: (event.products || []).map(p => ({
      name: p.name_brand || p.industry_name || 'Unknown',
      role: p.role || 'suspect',
    })),
    consumer: {
      age: event.consumer?.age || null,
      gender: event.consumer?.gender || null,
    },
  }));

  // Aggregate most common reactions
  const reactionCounts = {};
  events.forEach(e => {
    e.reactions.forEach(r => {
      reactionCounts[r] = (reactionCounts[r] || 0) + 1;
    });
  });

  const topReactions = Object.entries(reactionCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([reaction, count]) => ({ reaction, count }));

  return jsonResponse({
    success: true,
    query,
    totalReports: data.meta?.results?.total || events.length,
    topReactions,
    recentEvents: events.slice(0, 5),
    safetyNote: 'Adverse event reports do NOT establish causation. Many reports involve multiple products. Always consult your healthcare provider.',
  });
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=86400',
    },
  });
}
