/**
 * Smoke Tests — Guided Tour Registry
 *
 * Validates the tour registry integrity:
 *   - All 10 tours exist
 *   - Every tour has required fields
 *   - Tab-to-tour mapping is complete
 *   - Completion tracking works
 */
import { describe, it, expect, beforeEach } from 'vitest';
import {
  TOUR_REGISTRY,
  getTourForTab,
  isTourCompleted,
  resetAllTours,
  resetTour,
  type TourId,
} from '../guidedTours';

describe('TOUR_REGISTRY', () => {
  const expectedTours: TourId[] = [
    'dashboard',
    'meal-plan',
    'recipe-library',
    'health-report',
    'fitness',
    'supplements',
    'brain-assessment',
    'labs',
    'household',
    'food-guide',
  ];

  it('should contain all 10 tours', () => {
    expect(Object.keys(TOUR_REGISTRY)).toHaveLength(10);
  });

  it.each(expectedTours)('should have tour "%s" in registry', (tourId) => {
    expect(TOUR_REGISTRY[tourId]).toBeDefined();
  });

  it('every tour should have label, description, emoji, and startFn', () => {
    for (const [id, tour] of Object.entries(TOUR_REGISTRY)) {
      expect(tour.label, `${id} missing label`).toBeTruthy();
      expect(tour.description, `${id} missing description`).toBeTruthy();
      expect(tour.emoji, `${id} missing emoji`).toBeTruthy();
      expect(typeof tour.startFn, `${id} startFn not a function`).toBe('function');
    }
  });
});

describe('getTourForTab', () => {
  it('should map "home" to "dashboard"', () => {
    expect(getTourForTab('home')).toBe('dashboard');
  });

  it('should map "weekly-plan" to "meal-plan"', () => {
    expect(getTourForTab('weekly-plan')).toBe('meal-plan');
  });

  it('should map "neuro-assessment" to "brain-assessment"', () => {
    expect(getTourForTab('neuro-assessment')).toBe('brain-assessment');
  });

  it('should return null for unknown tabs', () => {
    expect(getTourForTab('unknown-tab')).toBeNull();
    expect(getTourForTab('')).toBeNull();
  });

  it('should map all navigable tabs', () => {
    const tabs = [
      'home', 'weekly-plan', 'recipes', 'health-report',
      'fitness', 'supplements', 'neuro-assessment', 'labs',
      'household', 'food-guide',
    ];
    for (const tab of tabs) {
      expect(getTourForTab(tab), `Missing mapping for tab: ${tab}`).not.toBeNull();
    }
  });
});

describe('Tour completion tracking', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should start with no tours completed', () => {
    expect(isTourCompleted('dashboard')).toBe(false);
  });

  it('should track completion via localStorage', () => {
    // Manually set localStorage to simulate markTourComplete
    localStorage.setItem('nourishAI_completedTours', JSON.stringify(['dashboard']));
    expect(isTourCompleted('dashboard')).toBe(true);
    expect(isTourCompleted('fitness')).toBe(false);
  });

  it('should reset individual tours', () => {
    localStorage.setItem('nourishAI_completedTours', JSON.stringify(['dashboard', 'fitness']));
    resetTour('dashboard');
    expect(isTourCompleted('dashboard')).toBe(false);
    expect(isTourCompleted('fitness')).toBe(true);
  });

  it('should reset all tours', () => {
    localStorage.setItem('nourishAI_completedTours', JSON.stringify(['dashboard', 'fitness', 'labs']));
    resetAllTours();
    expect(isTourCompleted('dashboard')).toBe(false);
    expect(isTourCompleted('fitness')).toBe(false);
    expect(isTourCompleted('labs')).toBe(false);
  });
});
