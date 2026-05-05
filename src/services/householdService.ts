// Household Service — uses shared API client
import type {
  Household,
  CreateHouseholdData,
  UpdateHouseholdData,
  HouseholdMember,
} from '../types/household';
import type { ApiResponse } from '../types/api';
import { api } from './apiClient';

class HouseholdService {
  // List user's households
  async getUserHouseholds(): Promise<ApiResponse<Household[]>> {
    try {
      return await api.get<Household[]>('/households');
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load households' };
    }
  }

  // Create new household
  async createHousehold(data: CreateHouseholdData): Promise<ApiResponse<Household>> {
    try {
      return await api.post<Household>('/households', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to create household' };
    }
  }

  // Get household by ID
  async getHousehold(householdId: string): Promise<ApiResponse<Household>> {
    try {
      return await api.get<Household>(`/households/${householdId}`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load household' };
    }
  }

  // Update household
  async updateHousehold(householdId: string, data: UpdateHouseholdData): Promise<ApiResponse<Household>> {
    try {
      return await api.patch<Household>(`/households/${householdId}`, data);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update household' };
    }
  }

  // Delete household
  async deleteHousehold(householdId: string): Promise<ApiResponse> {
    try {
      return await api.delete(`/households/${householdId}`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to delete household' };
    }
  }

  // Generate invite code
  async generateInvite(householdId: string): Promise<ApiResponse<{ inviteCode: string; expiresAt: string }>> {
    try {
      return await api.post(`/households/${householdId}/invite`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to generate invite' };
    }
  }

  // Join household via invite code
  async joinHousehold(inviteCode: string): Promise<ApiResponse<Household>> {
    try {
      return await api.post<Household>(`/households/join/${inviteCode}`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to join household' };
    }
  }

  // Leave household
  async leaveHousehold(householdId: string): Promise<ApiResponse> {
    try {
      return await api.post(`/households/${householdId}/leave`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to leave household' };
    }
  }

  // Get household members
  async getHouseholdMembers(householdId: string): Promise<ApiResponse<HouseholdMember[]>> {
    try {
      return await api.get<HouseholdMember[]>(`/households/${householdId}/members`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load members' };
    }
  }

  // Update member role
  async updateMemberRole(
    householdId: string,
    userId: string,
    role: 'admin' | 'member'
  ): Promise<ApiResponse> {
    try {
      return await api.patch(`/households/${householdId}/members/${userId}/role`, { role });
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update role' };
    }
  }
}

// Export singleton instance
export const householdService = new HouseholdService();
