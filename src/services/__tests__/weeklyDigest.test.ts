/**
 * Smoke Tests — Weekly Digest Service
 *
 * Validates the HTML email digest generator:
 *   - HTML structure and required sections
 *   - Data-driven content injection
 *   - Inline styles (no external CSS)
 */
import { describe, it, expect } from 'vitest';
import { generateDigestHTML } from '../weeklyDigest';

const mockData = {
  personName: 'John Doe',
  bloodType: 'O+',
  weekOf: 'Apr 28',
  mealPlanAdherence: 85,
  totalMeals: 28,
  topBenefits: ['Brain Health', 'Gut Support', 'Anti-Inflammatory'],
  labAlerts: [
    { marker: 'Vitamin D', value: '18 ng/mL', status: 'low' as const },
    { marker: 'Iron', value: '250 µg/dL', status: 'high' as const },
  ],
  fitnessStreak: 5,
  workoutsCompleted: 4,
  caloriesBurned: 1200,
  neuroProfile: { dominant: 'Dopamine', deficiency: 'GABA' },
  supplementsTracked: 8,
  actionItems: [
    'Review O+ optimized meals',
    'Check Vitamin D with your doctor',
    'Try 3 new recipes',
  ],
};

describe('generateDigestHTML', () => {
  it('should return a complete HTML document', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('<!DOCTYPE html>');
    expect(html).toContain('<html');
    expect(html).toContain('</html>');
    expect(html).toContain('<body');
    expect(html).toContain('</body>');
  });

  it('should include the person name and blood type', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('John Doe');
    expect(html).toContain('O+');
  });

  it('should include meal adherence percentage', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('85%');
  });

  it('should include health benefit badges', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('Brain Health');
    expect(html).toContain('Gut Support');
    expect(html).toContain('Anti-Inflammatory');
  });

  it('should include lab alerts when present', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('Vitamin D');
    expect(html).toContain('18 ng/mL');
    expect(html).toContain('Iron');
  });

  it('should omit lab alerts section when none present', () => {
    const noAlerts = { ...mockData, labAlerts: [] };
    const html = generateDigestHTML(noAlerts);
    expect(html).not.toContain('Lab Biomarker Alerts');
  });

  it('should include action items', () => {
    const html = generateDigestHTML(mockData);
    for (const item of mockData.actionItems) {
      expect(html).toContain(item);
    }
  });

  it('should use inline styles only (no external CSS)', () => {
    const html = generateDigestHTML(mockData);
    expect(html).not.toContain('<link rel="stylesheet"');
    expect(html).not.toMatch(/<style[^>]*>/);
    // Should have inline style attributes
    expect(html).toContain('style="');
  });

  it('should include the NourishAI branding', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('NourishAI');
    expect(html).toContain('Weekly Digest');
  });

  it('should include the CTA button', () => {
    const html = generateDigestHTML(mockData);
    expect(html).toContain('Open NourishAI Dashboard');
  });
});
