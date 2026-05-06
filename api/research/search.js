/**
 * Vercel Serverless Function — PubMed Research Proxy
 * 
 * Searches PubMed for evidence-based research on nutrition,
 * supplements, and health topics. 100% free via NCBI E-utilities.
 * 
 * GET /api/research/search?q=vitamin+D+deficiency&maxResults=5
 */

export const config = {
  runtime: 'edge',
};

const EUTILS_BASE = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const APP_NAME = 'MealPlanAssistant';
const APP_EMAIL = 'info@newmindsgroup.com';

export default async function handler(req) {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  const maxResults = Math.min(parseInt(url.searchParams.get('maxResults') || '5'), 10);

  if (!query) {
    return jsonResponse({ success: false, error: 'Query parameter "q" is required' }, 400);
  }

  try {
    // Step 1: Search for article IDs
    const apiKey = process.env.NCBI_API_KEY || '';
    const keyParam = apiKey ? `&api_key=${apiKey}` : '';

    const searchUrl = `${EUTILS_BASE}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&sort=relevance&retmode=json&tool=${APP_NAME}&email=${APP_EMAIL}${keyParam}`;

    const searchResponse = await fetch(searchUrl);
    if (!searchResponse.ok) {
      return jsonResponse({ success: false, error: 'PubMed search failed' }, 502);
    }

    const searchData = await searchResponse.json();
    const ids = searchData.esearchresult?.idlist || [];

    if (ids.length === 0) {
      return jsonResponse({
        success: true,
        totalResults: 0,
        data: [],
        query,
      });
    }

    // Step 2: Fetch article summaries
    const summaryUrl = `${EUTILS_BASE}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json&tool=${APP_NAME}&email=${APP_EMAIL}${keyParam}`;

    const summaryResponse = await fetch(summaryUrl);
    if (!summaryResponse.ok) {
      return jsonResponse({ success: false, error: 'PubMed fetch failed' }, 502);
    }

    const summaryData = await summaryResponse.json();
    const articles = ids.map(id => {
      const article = summaryData.result?.[id];
      if (!article) return null;

      return {
        pmid: id,
        title: article.title || 'Untitled',
        authors: (article.authors || []).slice(0, 3).map(a => a.name).join(', '),
        journal: article.source || null,
        pubDate: article.pubdate || null,
        pubType: (article.pubtype || []).join(', '),
        doi: article.elocationid || null,
        url: `https://pubmed.ncbi.nlm.nih.gov/${id}/`,
        // Mark if it's a clinical trial, meta-analysis, or review
        evidenceLevel: classifyEvidenceLevel(article.pubtype || []),
      };
    }).filter(Boolean);

    return jsonResponse({
      success: true,
      totalResults: parseInt(searchData.esearchresult?.count || '0'),
      query,
      data: articles,
    });
  } catch (error) {
    console.error('[PubMed Proxy Error]', error);
    return jsonResponse({ success: false, error: 'Failed to search research database' }, 500);
  }
}

function classifyEvidenceLevel(pubTypes) {
  const types = pubTypes.map(t => t.toLowerCase());

  if (types.some(t => t.includes('meta-analysis'))) return 'meta-analysis';
  if (types.some(t => t.includes('systematic review'))) return 'systematic-review';
  if (types.some(t => t.includes('randomized controlled trial'))) return 'rct';
  if (types.some(t => t.includes('clinical trial'))) return 'clinical-trial';
  if (types.some(t => t.includes('review'))) return 'review';
  if (types.some(t => t.includes('observational'))) return 'observational';

  return 'other';
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
