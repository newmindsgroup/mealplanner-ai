// Invitation Service
import type {
  Invitation,
  SendInvitationData,
  InvitationResponse,
} from '../types/invitation';
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

class InvitationService {
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

  // Send invitation
  async sendInvitation(data: SendInvitationData): Promise<ApiResponse<Invitation>> {
    try {
      const response = await this.fetchApi<Invitation>('/invitations', {
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

  // Get household invitations
  async getHouseholdInvitations(householdId: string): Promise<ApiResponse<Invitation[]>> {
    try {
      const response = await this.fetchApi<Invitation[]>(
        `/invitations/household/${householdId}`
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

  // Get invitation by token
  async getInvitationByToken(token: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await this.fetchApi<Invitation>(`/invitations/token/${token}`);
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

  // Accept invitation
  async acceptInvitation(invitationId: string): Promise<ApiResponse<InvitationResponse>> {
    try {
      const response = await this.fetchApi<InvitationResponse>(
        `/invitations/${invitationId}/accept`,
        {
          method: 'PUT',
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

  // Decline invitation
  async declineInvitation(invitationId: string): Promise<ApiResponse<InvitationResponse>> {
    try {
      const response = await this.fetchApi<InvitationResponse>(
        `/invitations/${invitationId}/decline`,
        {
          method: 'PUT',
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

  // Revoke invitation
  async revokeInvitation(invitationId: string): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi(`/invitations/${invitationId}`, {
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

  // Resend invitation
  async resendInvitation(invitationId: string): Promise<ApiResponse<Invitation>> {
    try {
      const response = await this.fetchApi<Invitation>(
        `/invitations/${invitationId}/resend`,
        {
          method: 'POST',
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

  // Get pending invitations for current user
  async getMyInvitations(): Promise<ApiResponse<Invitation[]>> {
    try {
      const response = await this.fetchApi<Invitation[]>('/invitations/my');
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
export const invitationService = new InvitationService();

