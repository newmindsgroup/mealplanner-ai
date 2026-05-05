// Profile Service — uses shared API client
import type {
  UserProfile,
  UpdateProfileData,
  ChangePasswordData,
} from '../types/profile';
import type { User } from '../types/auth';
import type { ApiResponse } from '../types/api';
import { api, apiUpload } from './apiClient';

class ProfileService {
  // Get user profile
  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      return await api.get<UserProfile>('/users/me');
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load profile' };
    }
  }

  // Update profile
  async updateProfile(data: UpdateProfileData): Promise<ApiResponse<UserProfile>> {
    try {
      return await api.patch<UserProfile>('/users/me', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update profile' };
    }
  }

  // Upload avatar
  async uploadAvatar(file: File): Promise<ApiResponse<{ avatarUrl: string }>> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      return await api.upload<{ avatarUrl: string }>('/users/me/avatar', formData);
    } catch (error: any) {
      return { success: false, error: error.message || 'Upload failed' };
    }
  }

  // Change password
  async changePassword(data: ChangePasswordData): Promise<ApiResponse> {
    try {
      return await api.patch('/users/password', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to change password' };
    }
  }

  // Delete account
  async deleteAccount(password: string): Promise<ApiResponse> {
    try {
      return await api.delete('/users/account', { password });
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete account' };
    }
  }

  // Update user settings
  async updateSettings(settings: Record<string, any>): Promise<ApiResponse> {
    try {
      return await api.patch('/users/settings', settings);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update settings' };
    }
  }

  // Update dietary preferences
  async updatePreferences(preferences: Record<string, any>): Promise<ApiResponse> {
    try {
      return await api.patch('/users/preferences', preferences);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update preferences' };
    }
  }

  // Get progress / gamification data
  async getProgress(): Promise<ApiResponse> {
    try {
      return await api.get('/users/progress');
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load progress' };
    }
  }

  // Add XP
  async addXP(amount: number, reason?: string): Promise<ApiResponse> {
    try {
      return await api.post('/users/progress/xp', { amount, reason });
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add XP' };
    }
  }

  // Store/update API key
  async storeApiKey(provider: 'openai' | 'anthropic', key: string): Promise<ApiResponse> {
    try {
      return await api.post('/users/api-keys', { provider, key });
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to store API key' };
    }
  }

  // List configured API key providers
  async getApiKeyProviders(): Promise<ApiResponse<string[]>> {
    try {
      return await api.get<string[]>('/users/api-keys');
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load API keys' };
    }
  }
}

// Export singleton instance
export const profileService = new ProfileService();
