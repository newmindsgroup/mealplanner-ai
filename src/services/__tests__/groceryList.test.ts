/**
 * Smoke Tests — Grocery List Service
 *
 * Validates the core grocery list generation logic:
 *   - Category classification
 *   - Duplicate consolidation
 *   - Alphabetical + category sorting
 */
import { describe, it, expect } from 'vitest';
import { generateGroceryList } from '../groceryList';
import type { WeeklyPlan, Meal, DayPlan } from '../../types';

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeMeal(ingredients: string[], overrides?: Partial<Meal>): Meal {
  return {
    id: crypto.randomUUID(),
    name: 'Test Meal',
    type: 'lunch',
    description: '',
    ingredients,
    instructions: [],
    prepTime: 10,
    cookTime: 20,
    rationale: '',
    bloodTypeCompatible: ['O+'],
    tags: [],
    ...overrides,
  };
}

function makeDay(ingredients: string[]): DayPlan {
  const meal = makeMeal(ingredients);
  return {
    date: new Date().toISOString(),
    breakfast: meal,
    lunch: meal,
    dinner: meal,
    snack: meal,
  };
}

function makePlan(days: DayPlan[]): WeeklyPlan {
  return {
    id: crypto.randomUUID(),
    weekStart: new Date().toISOString(),
    days,
    people: [],
    createdAt: new Date().toISOString(),
  };
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe('generateGroceryList', () => {
  it('should generate items from meal plan ingredients', () => {
    const plan = makePlan([makeDay(['chicken breast', 'broccoli', 'rice'])]);
    const result = generateGroceryList(plan);

    expect(result.items.length).toBe(3);
    expect(result.items.map(i => i.name.toLowerCase())).toContain('chicken breast');
    expect(result.items.map(i => i.name.toLowerCase())).toContain('broccoli');
    expect(result.items.map(i => i.name.toLowerCase())).toContain('rice');
  });

  it('should classify ingredients into correct categories', () => {
    const plan = makePlan([makeDay(['salmon', 'spinach', 'quinoa', 'yogurt', 'almonds'])]);
    const result = generateGroceryList(plan);

    const byName = (name: string) => result.items.find(i => i.name.toLowerCase() === name);
    expect(byName('salmon')?.category).toBe('Proteins');
    expect(byName('spinach')?.category).toBe('Vegetables');
    expect(byName('quinoa')?.category).toBe('Grains');
    expect(byName('yogurt')?.category).toBe('Dairy');
    expect(byName('almonds')?.category).toBe('Nuts & Seeds');
  });

  it('should consolidate duplicate ingredients across meals', () => {
    const day: DayPlan = {
      date: new Date().toISOString(),
      breakfast: makeMeal(['eggs']),
      lunch: makeMeal(['eggs']),
      dinner: makeMeal(['chicken breast']),
      snack: makeMeal(['eggs']),
    };
    const plan = makePlan([day]);
    const result = generateGroceryList(plan);

    const eggs = result.items.find(i => i.name.toLowerCase() === 'eggs');
    expect(eggs).toBeDefined();
    // eggs appears 3 times: quantity should be "3"
    expect(eggs!.quantity).toBe('3');
  });

  it('should sort items by category then name', () => {
    const plan = makePlan([makeDay(['yogurt', 'apple', 'chicken', 'broccoli'])]);
    const result = generateGroceryList(plan);

    const categories = result.items.map(i => i.category);
    const sorted = [...categories].sort();
    expect(categories).toEqual(sorted);
  });

  it('should return an empty list for a plan with no days', () => {
    const plan = makePlan([]);
    const result = generateGroceryList(plan);
    expect(result.items).toHaveLength(0);
  });

  it('should fallback unknown ingredients to "Other" category', () => {
    const plan = makePlan([makeDay(['dragon fruit extract'])]);
    const result = generateGroceryList(plan);
    expect(result.items[0].category).toBe('Other');
  });

  it('should capitalize item names', () => {
    const plan = makePlan([makeDay(['chicken breast'])]);
    const result = generateGroceryList(plan);
    expect(result.items[0].name).toBe('Chicken breast');
  });

  it('should initialize all items as unchecked', () => {
    const plan = makePlan([makeDay(['salmon', 'rice'])]);
    const result = generateGroceryList(plan);
    expect(result.items.every(i => i.checked === false)).toBe(true);
  });
});
