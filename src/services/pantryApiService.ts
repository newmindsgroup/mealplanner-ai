// Pantry API Service — backend-connected pantry management
import type { PantryItem, PantrySettings, LowStockAlert, ExpirationAlert } from '../types';
import type { ApiResponse } from '../types/api';
import { api, isMockMode } from './apiClient';

class PantryApiService {
  // ─── Items ───────────────────────────────────────────────────────

  async getItems(): Promise<ApiResponse<PantryItem[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get<PantryItem[]>('/pantry');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addItem(item: Omit<PantryItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<PantryItem>> {
    if (isMockMode()) {
      const mockItem: PantryItem = {
        ...item as any,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      return { success: true, data: mockItem };
    }
    try {
      return await api.post<PantryItem>('/pantry', item);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateItem(id: string, updates: Partial<PantryItem>): Promise<ApiResponse<PantryItem>> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch<PantryItem>(`/pantry/${id}`, updates);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async removeItem(id: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.delete(`/pantry/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async adjustQuantity(id: string, quantityChange: number): Promise<ApiResponse<PantryItem>> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch<PantryItem>(`/pantry/${id}/quantity`, { quantityChange });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async recordUsage(itemId: string, quantityUsed: number, usedInMeal?: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.post(`/pantry/${itemId}/usage`, { quantityUsed, usedInMeal });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Settings ────────────────────────────────────────────────────

  async getSettings(): Promise<ApiResponse<PantrySettings>> {
    if (isMockMode()) return { success: true, data: undefined };
    try {
      return await api.get<PantrySettings>('/pantry/settings');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateSettings(settings: Partial<PantrySettings>): Promise<ApiResponse<PantrySettings>> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch<PantrySettings>('/pantry/settings', settings);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Alerts ──────────────────────────────────────────────────────

  async getLowStockAlerts(): Promise<ApiResponse<LowStockAlert[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get<LowStockAlert[]>('/pantry/alerts/low-stock');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getExpirationAlerts(): Promise<ApiResponse<ExpirationAlert[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get<ExpirationAlert[]>('/pantry/alerts/expiring');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async acknowledgeAlert(alertId: string, type: 'low-stock' | 'expiration'): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch(`/pantry/alerts/${type}/${alertId}/acknowledge`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Stats ───────────────────────────────────────────────────────

  async getStats(): Promise<ApiResponse<any>> {
    if (isMockMode()) return { success: true, data: null };
    try {
      return await api.get('/pantry/stats');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const pantryApiService = new PantryApiService();
