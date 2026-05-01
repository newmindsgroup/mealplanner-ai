// Profile Service
import type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
} from '../types/profile';
import type { User } from '../types/auth';
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

class ProfileService {
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

  // Get user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.fetchApi<UserProfile>('/users/me/profile');
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

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    try {
      const response = await this.fetchApi<UserProfile>('/users/me/profile', {
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

  // Upload avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const token = authService.getToken();
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.apiUrl}/users/me/avatar`, {
        method: 'POST',
        headers,
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiErrorClass(
          data.message || 'Upload failed',
          response.status
        );
      }

      return data;
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

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi('/users/me/password', {
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

  // Delete account
  async deleteAccount(password: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi('/users/me', {
        method: 'DELETE',
        body: JSON.stringify({ password }),
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

  // Update user info
  async updateUser(data: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.fetchApi<User>('/users/me', {
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
}

// Export singleton instance
export const profileService = new ProfileService();

