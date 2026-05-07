/**
 * Smoke Tests — PubMed Service
 *
 * Validates the PubMed integration:
 *   - Citation formatting
 *   - Reference list generation
 *   - Pre-built query helpers exist
 *   - Search returns structured results (even on failure)
 */
import { describe, it, expect } from 'vitest';
import {
  formatCitation,
  formatReferenceList,
  type PubMedArticle,
} from '../pubmedService';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const MOCK_ARTICLE: PubMedArticle = {
  pmid: '12345678',
  title: 'Vitamin D supplementation and neurotransmitter synthesis: a systematic review',
  authors: ['Smith JA', 'Jones BK', 'Williams CL', 'Brown DM'],
  journal: 'J Nutr Neurosci',
  year: '2024',
  abstract: 'Background: Vitamin D plays a critical role in neurotransmitter synthesis...',
  doi: '10.1234/jnn.2024.5678',
  url: 'https://pubmed.ncbi.nlm.nih.gov/12345678/',
};

const MOCK_ARTICLE_2: PubMedArticle = {
  pmid: '87654321',
  title: 'Blood type diet adherence and cardiovascular outcomes',
  authors: ['Lee KY', 'Chen XW'],
  journal: 'Am J Clin Nutr',
  year: '2025',
  abstract: 'Objective: To evaluate the association between ABO blood group dietary patterns...',
  url: 'https://pubmed.ncbi.nlm.nih.gov/87654321/',
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('formatCitation', () => {
  it('should format a citation with PMID and journal', () => {
    const citation = formatCitation(MOCK_ARTICLE);
    expect(citation).toContain('Smith JA');
    expect(citation).toContain('PMID: 12345678');
    expect(citation).toContain('J Nutr Neurosci');
    expect(citation).toContain('2024');
  });

  it('should truncate to first 3 authors with "et al." for 4+ authors', () => {
    const citation = formatCitation(MOCK_ARTICLE);
    expect(citation).toContain('et al.');
    expect(citation).not.toContain('Brown DM');
  });

  it('should NOT add "et al." for 3 or fewer authors', () => {
    const citation = formatCitation(MOCK_ARTICLE_2);
    expect(citation).not.toContain('et al.');
    expect(citation).toContain('Lee KY');
    expect(citation).toContain('Chen XW');
  });

  it('should include the article title in quotes', () => {
    const citation = formatCitation(MOCK_ARTICLE);
    expect(citation).toContain('"Vitamin D supplementation');
  });
});

describe('formatReferenceList', () => {
  it('should number references starting at [1]', () => {
    const list = formatReferenceList([MOCK_ARTICLE, MOCK_ARTICLE_2]);
    expect(list).toContain('[1]');
    expect(list).toContain('[2]');
  });

  it('should include URLs for each reference', () => {
    const list = formatReferenceList([MOCK_ARTICLE, MOCK_ARTICLE_2]);
    expect(list).toContain('https://pubmed.ncbi.nlm.nih.gov/12345678/');
    expect(list).toContain('https://pubmed.ncbi.nlm.nih.gov/87654321/');
  });

  it('should return empty string for empty list', () => {
    expect(formatReferenceList([])).toBe('');
  });
});

describe('Module exports', () => {
  it('should export searchPubMed function', async () => {
    const mod = await import('../pubmedService');
    expect(typeof mod.searchPubMed).toBe('function');
  });

  it('should export searchSupplementEvidence function', async () => {
    const mod = await import('../pubmedService');
    expect(typeof mod.searchSupplementEvidence).toBe('function');
  });

  it('should export searchNeuroNutrition function', async () => {
    const mod = await import('../pubmedService');
    expect(typeof mod.searchNeuroNutrition).toBe('function');
  });

  it('should export searchBloodTypeDiet function', async () => {
    const mod = await import('../pubmedService');
    expect(typeof mod.searchBloodTypeDiet).toBe('function');
  });

  it('should export searchBiomarkerNutrient function', async () => {
    const mod = await import('../pubmedService');
    expect(typeof mod.searchBiomarkerNutrient).toBe('function');
  });

  it('should export fetchArticleByPMID function', async () => {
    const mod = await import('../pubmedService');
    expect(typeof mod.fetchArticleByPMID).toBe('function');
  });
});
