/**
 * Smoke Tests — Household Food Comparison Service
 *
 * Validates the food compatibility matrix logic:
 *   - Report generation for mixed households
 *   - Universal safe food detection
 *   - Conflict detection
 *   - Edge cases (empty households, single member)
 */
import { describe, it, expect } from 'vitest';
import {
  generateHouseholdFoodReport,
  checkFoodForHousehold,
  type HouseholdMember,
} from '../householdFoodComparison';

// ─── Fixtures ───────────────────────────────────────────────────────────────

const FAMILY: HouseholdMember[] = [
  { name: 'Dad', bloodType: 'O+' },
  { name: 'Mom', bloodType: 'A+' },
  { name: 'Kid', bloodType: 'B+' },
];

const SINGLE: HouseholdMember[] = [
  { name: 'Solo', bloodType: 'AB+' },
];

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('generateHouseholdFoodReport', () => {
  it('should return empty report for empty household', () => {
    const report = generateHouseholdFoodReport([]);
    expect(report.members).toHaveLength(0);
    expect(report.universalSafe).toHaveLength(0);
    expect(report.conflicts).toHaveLength(0);
    expect(report.stats.totalFoodsAnalyzed).toBe(0);
  });

  it('should generate report for single-member household', () => {
    const report = generateHouseholdFoodReport(SINGLE);
    expect(report.members).toHaveLength(1);
    expect(report.stats.totalFoodsAnalyzed).toBeGreaterThan(0);
    // Single member can still have "avoid" foods for their blood type
    const totalCategorized = report.universalSafe.length + report.recommended.length + report.conflicts.length;
    expect(totalCategorized).toBe(report.stats.totalFoodsAnalyzed);
  });

  it('should generate report for multi-member household', () => {
    const report = generateHouseholdFoodReport(FAMILY);
    expect(report.members).toHaveLength(3);
    expect(report.stats.totalFoodsAnalyzed).toBeGreaterThan(0);
    // Mixed blood types should produce some conflicts
    expect(report.stats.conflictCount).toBeGreaterThan(0);
    // Should still have universal safe foods
    expect(report.stats.universalSafeCount).toBeGreaterThan(0);
  });

  it('should categorize foods into universalSafe, recommended, and conflicts', () => {
    const report = generateHouseholdFoodReport(FAMILY);
    const totalCategorized = report.universalSafe.length + report.recommended.length + report.conflicts.length;
    expect(totalCategorized).toBe(report.stats.totalFoodsAnalyzed);
  });

  it('should mark all universalSafe foods as householdSafe', () => {
    const report = generateHouseholdFoodReport(FAMILY);
    for (const food of report.universalSafe) {
      expect(food.householdSafe).toBe(true);
      expect(food.avoidBy).toHaveLength(0);
    }
  });

  it('should mark all conflict foods as NOT householdSafe', () => {
    const report = generateHouseholdFoodReport(FAMILY);
    for (const food of report.conflicts) {
      expect(food.householdSafe).toBe(false);
      expect(food.avoidBy.length).toBeGreaterThan(0);
    }
  });

  it('should include per-member ratings in every food comparison', () => {
    const report = generateHouseholdFoodReport(FAMILY);
    const allFoods = [...report.universalSafe, ...report.recommended, ...report.conflicts];
    for (const food of allFoods) {
      for (const member of FAMILY) {
        expect(food.ratings[member.name]).toBeDefined();
      }
    }
  });
});

describe('checkFoodForHousehold', () => {
  it('should return safety status for a specific food', () => {
    const result = checkFoodForHousehold('salmon', FAMILY);
    expect(result).toHaveProperty('safe');
    expect(result).toHaveProperty('details');
    expect(result.details).toHaveLength(FAMILY.length);
  });

  it('should include a rating for each member', () => {
    const result = checkFoodForHousehold('chicken', FAMILY);
    for (const detail of result.details) {
      expect(['beneficial', 'neutral', 'avoid']).toContain(detail.rating);
    }
  });

  it('should mark food as unsafe if any member avoids it', () => {
    const result = checkFoodForHousehold('chicken', FAMILY);
    const hasAvoider = result.details.some(d => d.rating === 'avoid');
    if (hasAvoider) {
      expect(result.safe).toBe(false);
    }
  });
});
