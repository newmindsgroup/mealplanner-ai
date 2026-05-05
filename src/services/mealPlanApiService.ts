// Meal Plan API Service — backend-connected meal planning operations
// Wraps the existing local meal planning logic and adds API persistence
import type { Person, WeeklyPlan } from '../types';
import type { ApiResponse } from '../types/api';
import { api, isMockMode } from './apiClient';
import { generateWeeklyPlan as generateLocalPlan } from './mealPlanning';

class MealPlanApiService {
  // List meal plans from server
  async getPlans(): Promise<ApiResponse<WeeklyPlan[]>> {
    if (isMockMode()) {
      return { success: true, data: [] };
    }
    try {
      return await api.get<WeeklyPlan[]>('/meals/plans');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Generate a new meal plan (uses AI or local fallback), then saves to server
  async generatePlan(
    people: Person[],
    options?: {
      goals?: string[];
      cuisinePreferences?: string[];
      timeConstraints?: string;
      pantryItems?: string[];
      budgetPreference?: string;
      prioritizePantryItems?: boolean;
      useExpiringItems?: boolean;
    }
  ): Promise<ApiResponse<WeeklyPlan>> {
    try {
      // Generate the plan locally (it already uses AI if available)
      const plan = await generateLocalPlan(people, options);

      // If we have a backend, save it
      if (!isMockMode()) {
        try {
          const saved = await api.post<WeeklyPlan>('/meals/plans', {
            planData: plan,
            peopleIds: people.map(p => p.id),
            preferences: options,
          });
          if (saved.success && saved.data) {
            return saved;
          }
        } catch (e) {
          console.warn('Failed to save plan to server, using local plan:', e);
        }
      }

      return { success: true, data: plan };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get plan details
  async getPlan(id: string): Promise<ApiResponse<WeeklyPlan>> {
    if (isMockMode()) {
      return { success: false, error: 'Not available in mock mode' };
    }
    try {
      return await api.get<WeeklyPlan>(`/meals/plans/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Delete plan
  async deletePlan(id: string): Promise<ApiResponse> {
    if (isMockMode()) {
      return { success: true };
    }
    try {
      return await api.delete(`/meals/plans/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Favorites ───────────────────────────────────────────────────

  async getFavorites(): Promise<ApiResponse<any[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get('/meals/favorites');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addFavorite(meal: any): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.post('/meals/favorites', meal);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async removeFavorite(id: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.delete(`/meals/favorites/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const mealPlanApiService = new MealPlanApiService();
