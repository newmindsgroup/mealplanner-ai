// Household Service
import type {
  Household,
  CreateHouseholdData,
  UpdateHouseholdData,
  HouseholdMember,
} from '../types/household';
import type { ApiResponse } from '../types/api';
import { ApiErrorClass } from '../types/api';
import { authService } from './authService';

// Base API URL
const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.apiUrl) {
    return (window as any).APP_CONFIG.apiUrl;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

class HouseholdService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = getApiUrl();
  }

  // Helper method to make API calls
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    const token = authService.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiErrorClass(
          data.message || 'An error occurred',
          response.status,
          data.errors
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        throw error;
      }
      throw new ApiErrorClass(
        error instanceof Error ? error.message : 'Network error',
        0
      );
    }
  }

  // Create new household
  async createHousehold(data: CreateHouseholdData): Promise<ApiResponse<Household>> {
    try {
      const response = await this.fetchApi<Household>('/households', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Get household by ID
  async getHousehold(householdId: string): Promise<ApiResponse<Household>> {
    try {
      const response = await this.fetchApi<Household>(`/households/${householdId}`);
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Get user's households
  async getUserHouseholds(): Promise<ApiResponse<Household[]>> {
    try {
      const response = await this.fetchApi<Household[]>('/households/my');
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Update household
  async updateHousehold(
    householdId: string,
    data: UpdateHouseholdData
  ): Promise<ApiResponse<Household>> {
    try {
      const response = await this.fetchApi<Household>(`/households/${householdId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Delete household
  async deleteHousehold(householdId: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi(`/households/${householdId}`, {
        method: 'DELETE',
      });
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Leave household
  async leaveHousehold(householdId: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi(`/households/${householdId}/leave`, {
        method: 'POST',
      });
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }

  // Get household members
  async getHouseholdMembers(householdId: string): Promise<ApiResponse<HouseholdMember[]>> {
    try {
      const response = await this.fetchApi<HouseholdMember[]>(
        `/households/${householdId}/members`
      );
      return response;
    } catch (error) {
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: 'An unexpected error occurred',
      };
    }
  }
}

// Export singleton instance
export const householdService = new HouseholdService();

