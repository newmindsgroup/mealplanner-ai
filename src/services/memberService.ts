// Member Service — Family members CRUD via backend API
import type { Person } from '../types';
import type { ApiResponse } from '../types/api';
import { api } from './apiClient';

class MemberService {
  // List family members
  async getMembers(): Promise<ApiResponse<Person[]>> {
    try {
      return await api.get<Person[]>('/people');
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load members' };
    }
  }

  // Add family member
  async addMember(member: Omit<Person, 'id'>): Promise<ApiResponse<Person>> {
    try {
      return await api.post<Person>('/people', member);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to add member' };
    }
  }

  // Get member by ID
  async getMember(id: string): Promise<ApiResponse<Person>> {
    try {
      return await api.get<Person>(`/people/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to load member' };
    }
  }

  // Update member
  async updateMember(id: string, updates: Partial<Person>): Promise<ApiResponse<Person>> {
    try {
      return await api.patch<Person>(`/people/${id}`, updates);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to update member' };
    }
  }

  // Remove member
  async removeMember(id: string): Promise<ApiResponse> {
    try {
      return await api.delete(`/people/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message || 'Failed to remove member' };
    }
  }
}

export const memberService = new MemberService();
