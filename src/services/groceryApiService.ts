// Grocery List API Service — backend-connected grocery management
import type { GroceryList, GroceryItem, WeeklyPlan, PantryItem, LowStockAlert } from '../types';
import type { ApiResponse } from '../types/api';
import { api, isMockMode } from './apiClient';
import { generateGroceryList, generateSmartGroceryList, addLowStockItemsToList } from './groceryList';

class GroceryApiService {
  // ─── CRUD ────────────────────────────────────────────────────────

  async getLists(): Promise<ApiResponse<GroceryList[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get<GroceryList[]>('/grocery');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getList(id: string): Promise<ApiResponse<GroceryList>> {
    if (isMockMode()) return { success: false, error: 'Not in mock mode' };
    try {
      return await api.get<GroceryList>(`/grocery/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async saveList(list: GroceryList): Promise<ApiResponse<GroceryList>> {
    if (isMockMode()) return { success: true, data: list };
    try {
      return await api.post<GroceryList>('/grocery', { listData: list });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateItem(listId: string, itemId: string, checked: boolean): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch(`/grocery/${listId}/items/${itemId}`, { checked });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteList(id: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.delete(`/grocery/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Generation (combines local logic + API persistence) ─────────

  async generateFromPlan(plan: WeeklyPlan): Promise<ApiResponse<GroceryList>> {
    const list = generateGroceryList(plan);
    return this.saveList(list);
  }

  async generateSmartList(
    plan: WeeklyPlan,
    pantryItems: PantryItem[],
    lowStockAlerts: LowStockAlert[]
  ): Promise<ApiResponse<GroceryList>> {
    const list = generateSmartGroceryList(plan, pantryItems, lowStockAlerts);
    return this.saveList(list);
  }

  async addLowStockItems(
    existingList: GroceryList,
    lowStockAlerts: LowStockAlert[],
    pantryItems: PantryItem[]
  ): Promise<ApiResponse<GroceryList>> {
    const updatedList = addLowStockItemsToList(existingList, lowStockAlerts, pantryItems);
    return this.saveList(updatedList);
  }
}

export const groceryApiService = new GroceryApiService();
