/**
 * pubmedService — Live PubMed (NCBI E-utilities) integration.
 *
 * Provides verified biomedical citations for the Swarm Analysis panel,
 * supplement protocols, and cross-domain health correlations.
 *
 * API Docs: https://www.ncbi.nlm.nih.gov/books/NBK25501/
 * Rate Limit: 3 req/sec without API key, 10 req/sec with key
 */

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  year: string;
  abstract: string;
  doi?: string;
  url: string;
}

export interface PubMedSearchResult {
  query: string;
  totalResults: number;
  articles: PubMedArticle[];
  searchedAt: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';
const DB = 'pubmed';

// ─── Search ─────────────────────────────────────────────────────────────────

/**
 * Search PubMed for articles matching a query.
 *
 * @param query - Natural-language or MeSH search term
 * @param maxResults - Max articles to return (default 5, max 20)
 * @returns Structured search results with article metadata and abstracts
 *
 * @example
 * ```ts
 * const results = await searchPubMed('vitamin D neurotransmitter GABA');
 * results.articles.forEach(a => console.log(a.title, a.url));
 * ```
 */
export async function searchPubMed(
  query: string,
  maxResults: number = 5,
): Promise<PubMedSearchResult> {
  const limit = Math.min(maxResults, 20);

  try {
    // Step 1: ESearch — get PMIDs
    const searchUrl = `${BASE_URL}/esearch.fcgi?db=${DB}&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json&sort=relevance`;
    const searchRes = await fetch(searchUrl);
    if (!searchRes.ok) throw new Error(`ESearch failed: ${searchRes.status}`);

    const searchData = await searchRes.json();
    const pmids: string[] = searchData?.esearchresult?.idlist || [];
    const totalResults = parseInt(searchData?.esearchresult?.count || '0', 10);

    if (pmids.length === 0) {
      return { query, totalResults: 0, articles: [], searchedAt: new Date().toISOString() };
    }

    // Step 2: EFetch — get article details
    const fetchUrl = `${BASE_URL}/efetch.fcgi?db=${DB}&id=${pmids.join(',')}&rettype=xml&retmode=xml`;
    const fetchRes = await fetch(fetchUrl);
    if (!fetchRes.ok) throw new Error(`EFetch failed: ${fetchRes.status}`);

    const xmlText = await fetchRes.text();
    const articles = parseArticlesFromXML(xmlText);

    return {
      query,
      totalResults,
      articles,
      searchedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('[PubMed] Search failed:', error);
    return {
      query,
      totalResults: 0,
      articles: [],
      searchedAt: new Date().toISOString(),
    };
  }
}

// ─── Fetch by PMID ──────────────────────────────────────────────────────────

/**
 * Fetch a specific article by its PubMed ID.
 */
export async function fetchArticleByPMID(pmid: string): Promise<PubMedArticle | null> {
  try {
    const fetchUrl = `${BASE_URL}/efetch.fcgi?db=${DB}&id=${pmid}&rettype=xml&retmode=xml`;
    const res = await fetch(fetchUrl);
    if (!res.ok) return null;

    const xmlText = await res.text();
    const articles = parseArticlesFromXML(xmlText);
    return articles[0] || null;
  } catch {
    return null;
  }
}

// ─── Pre-built Health Queries ───────────────────────────────────────────────

/** Search for studies on a supplement's efficacy and safety */
export async function searchSupplementEvidence(supplementName: string): Promise<PubMedSearchResult> {
  const query = `${supplementName}[Title/Abstract] AND (clinical trial[pt] OR meta-analysis[pt] OR systematic review[pt]) AND (efficacy OR safety OR dosage)`;
  return searchPubMed(query, 5);
}

/** Search for neurotransmitter-nutrition correlations */
export async function searchNeuroNutrition(neurotransmitter: string): Promise<PubMedSearchResult> {
  const query = `${neurotransmitter}[Title/Abstract] AND (nutrition OR diet OR supplement) AND (deficiency OR synthesis) AND humans[mh]`;
  return searchPubMed(query, 5);
}

/** Search for blood-type diet evidence */
export async function searchBloodTypeDiet(bloodType: string): Promise<PubMedSearchResult> {
  const query = `(blood type diet OR ABO blood group) AND (nutrition OR dietary) AND ${bloodType}`;
  return searchPubMed(query, 5);
}

/** Search for biomarker-nutrient interactions */
export async function searchBiomarkerNutrient(biomarker: string, nutrient: string): Promise<PubMedSearchResult> {
  const query = `${biomarker}[Title/Abstract] AND ${nutrient}[Title/Abstract] AND (supplementation OR intake OR deficiency)`;
  return searchPubMed(query, 5);
}

// ─── XML Parsing ────────────────────────────────────────────────────────────

/**
 * Parse PubMed XML response into structured article objects.
 * Uses browser-native DOMParser — no external dependencies.
 */
function parseArticlesFromXML(xml: string): PubMedArticle[] {
  const articles: PubMedArticle[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'text/xml');
    const articleNodes = doc.querySelectorAll('PubmedArticle');

    articleNodes.forEach((node) => {
      const pmid = node.querySelector('PMID')?.textContent || '';
      const title = node.querySelector('ArticleTitle')?.textContent || '';
      const abstractNode = node.querySelector('Abstract');
      const abstractText = abstractNode
        ? Array.from(abstractNode.querySelectorAll('AbstractText'))
            .map(n => n.textContent)
            .join(' ')
        : '';

      // Authors
      const authorNodes = node.querySelectorAll('Author');
      const authors: string[] = [];
      authorNodes.forEach((a) => {
        const last = a.querySelector('LastName')?.textContent || '';
        const initials = a.querySelector('Initials')?.textContent || '';
        if (last) authors.push(`${last} ${initials}`.trim());
      });

      // Journal
      const journal = node.querySelector('Journal Title')?.textContent
        || node.querySelector('ISOAbbreviation')?.textContent
        || node.querySelector('MedlineTA')?.textContent
        || '';

      // Year
      const year = node.querySelector('PubDate Year')?.textContent
        || node.querySelector('MedlineDate')?.textContent?.slice(0, 4)
        || '';

      // DOI
      const doiNode = Array.from(node.querySelectorAll('ArticleId'))
        .find(n => n.getAttribute('IdType') === 'doi');
      const doi = doiNode?.textContent || undefined;

      articles.push({
        pmid,
        title,
        authors: authors.slice(0, 5), // Limit to first 5 authors
        journal,
        year,
        abstract: abstractText,
        doi,
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      });
    });
  } catch (error) {
    console.error('[PubMed] XML parsing error:', error);
  }

  return articles;
}

// ─── Citation Formatting ────────────────────────────────────────────────────

/** Format an article as a standard citation string */
export function formatCitation(article: PubMedArticle): string {
  const authorStr = article.authors.length > 3
    ? `${article.authors.slice(0, 3).join(', ')}, et al.`
    : article.authors.join(', ');
  return `${authorStr} "${article.title}" ${article.journal}. ${article.year}. PMID: ${article.pmid}`;
}

/** Format multiple articles as a numbered reference list */
export function formatReferenceList(articles: PubMedArticle[]): string {
  return articles
    .map((a, i) => `[${i + 1}] ${formatCitation(a)}\n    ${a.url}`)
    .join('\n\n');
}
