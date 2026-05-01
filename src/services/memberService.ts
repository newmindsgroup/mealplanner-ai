// Member Management Service
import type { HouseholdMember, HouseholdRole } from '../types/household';
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

class MemberService {
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

  // List household members
  async listMembers(householdId: string): Promise<ApiResponse<HouseholdMember[]>> {
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

  // Update member role
  async updateMemberRole(
    householdId: string,
    memberId: string,
    role: HouseholdRole
  ): Promise<ApiResponse<HouseholdMember>> {
    try {
      const response = await this.fetchApi<HouseholdMember>(
        `/households/${householdId}/members/${memberId}/role`,
        {
          method: 'PUT',
          body: JSON.stringify({ role }),
        }
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

  // Remove member from household
  async removeMember(householdId: string, memberId: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi(
        `/households/${householdId}/members/${memberId}`,
        {
          method: 'DELETE',
        }
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

  // Transfer ownership
  async transferOwnership(
    householdId: string,
    newOwnerId: string
  ): Promise<ApiResponse<HouseholdMember>> {
    try {
      const response = await this.fetchApi<HouseholdMember>(
        `/households/${householdId}/transfer-ownership`,
        {
          method: 'POST',
          body: JSON.stringify({ newOwnerId }),
        }
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
export const memberService = new MemberService();

