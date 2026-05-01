// Authentication Service
import type {
  User,
  LoginCredentials,
  RegisterData,
  ForgotPasswordData,
  ResetPasswordData,
  AuthResponse,
  VerifyEmailData,
} from '../types/auth';
import type { ApiResponse } from '../types/api';
import { ApiErrorClass } from '../types/api';

// Base API URL - will be configured based on environment
const getApiUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).APP_CONFIG?.apiUrl) {
    return (window as any).APP_CONFIG.apiUrl;
  }
  return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
};

class AuthService {
  private apiUrl: string;
  private tokenKey = 'auth_token';
  private userKey = 'auth_user';
  private mockUsersKey = 'mock_users'; // For local storage mock mode
  private useMockMode: boolean = false;

  constructor() {
    this.apiUrl = getApiUrl();
    // Check if we should use mock mode (when API URL is not available or in development)
    this.useMockMode = !import.meta.env.VITE_API_URL && import.meta.env.DEV;
  }

  // Helper method to make API calls
  private async fetchApi<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.apiUrl}${endpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
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

  // Mock mode: Simple password hashing (for development only)
  private async hashPassword(password: string): Promise<string> {
    // Simple hash for mock mode (not secure, for dev only)
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Mock mode: Get all mock users
  private getMockUsers(): Map<string, { user: User; passwordHash: string }> {
    const stored = localStorage.getItem(this.mockUsersKey);
    if (!stored) return new Map();
    try {
      const data = JSON.parse(stored);
      return new Map(Object.entries(data));
    } catch {
      return new Map();
    }
  }

  // Mock mode: Save mock users
  private saveMockUsers(users: Map<string, { user: User; passwordHash: string }>): void {
    const data = Object.fromEntries(users);
    localStorage.setItem(this.mockUsersKey, JSON.stringify(data));
  }

  // Store token and user in localStorage/sessionStorage
  private storeAuth(token: string, user: User, rememberMe: boolean = false): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);
    storage.setItem(this.userKey, JSON.stringify(user));
  }

  // Remove token and user from storage
  private clearAuth(): void {
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }

  // Get stored token
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey) || sessionStorage.getItem(this.tokenKey);
  }

  // Get stored user
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    // Try real API first, fall back to mock mode on error
    const apiAvailable = import.meta.env.VITE_API_URL && !this.useMockMode;
    
    if (!apiAvailable) {
      return this.registerMock(data);
    }

    // Real API mode - try API, fall back to mock on failure
    try {
      const response = await this.fetchApi<{ user: User; token: string }>(
        '/auth/register',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        this.storeAuth(token, user, true);
        return {
          success: true,
          user,
          token,
          message: 'Registration successful',
        };
      }

      return {
        success: false,
        error: response.message || 'Registration failed',
      };
    } catch (error) {
      // If API fails, fall back to mock mode
      if (error instanceof ApiErrorClass && error.status === 0) {
        // Network error - use mock mode
        return this.registerMock(data);
      }
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      // Network error - fall back to mock
      return this.registerMock(data);
    }
  }

  // Mock registration helper
  private async registerMock(data: RegisterData): Promise<AuthResponse> {
    try {
      // Validation
      if (!data.email || !data.password || !data.name) {
        return {
          success: false,
          error: 'All fields are required',
        };
      }

      if (data.password !== data.confirmPassword) {
        return {
          success: false,
          error: 'Passwords do not match',
        };
      }

      if (data.password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters',
        };
      }

      const mockUsers = this.getMockUsers();
      
      // Check if user already exists
      if (mockUsers.has(data.email.toLowerCase())) {
        return {
          success: false,
          error: 'Email already registered',
        };
      }

      // Create user
      const passwordHash = await this.hashPassword(data.password);
      const user: User = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        email: data.email.toLowerCase(),
        name: data.name,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      // Store user
      mockUsers.set(data.email.toLowerCase(), { user, passwordHash });
      this.saveMockUsers(mockUsers);

      // Generate mock token
      const token = `mock_token_${user.id}_${Date.now()}`;
      this.storeAuth(token, user, true);

      return {
        success: true,
        user,
        token,
        message: 'Registration successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    // Try real API first, fall back to mock mode on error
    const apiAvailable = import.meta.env.VITE_API_URL && !this.useMockMode;
    
    if (!apiAvailable) {
      return this.loginMock(credentials);
    }

    // Real API mode - try API, fall back to mock on failure
    try {
      const response = await this.fetchApi<{ user: User; token: string }>(
        '/auth/login',
        {
          method: 'POST',
          body: JSON.stringify(credentials),
        }
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        this.storeAuth(token, user, credentials.rememberMe || false);
        return {
          success: true,
          user,
          token,
          message: 'Login successful',
        };
      }

      return {
        success: false,
        error: response.message || 'Login failed',
      };
    } catch (error) {
      // If API fails, fall back to mock mode
      if (error instanceof ApiErrorClass && error.status === 0) {
        // Network error - use mock mode
        return this.loginMock(credentials);
      }
      if (error instanceof ApiErrorClass) {
        return {
          success: false,
          error: error.message,
        };
      }
      // Network error - fall back to mock
      return this.loginMock(credentials);
    }
  }

  // Mock login helper
  private async loginMock(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        return {
          success: false,
          error: 'Email and password are required',
        };
      }

      const mockUsers = this.getMockUsers();
      const userData = mockUsers.get(credentials.email.toLowerCase());

      if (!userData) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Verify password
      const passwordHash = await this.hashPassword(credentials.password);
      if (passwordHash !== userData.passwordHash) {
        return {
          success: false,
          error: 'Invalid email or password',
        };
      }

      // Update last login
      const user: User = {
        ...userData.user,
        lastLogin: new Date().toISOString(),
      };

      // Generate mock token
      const token = `mock_token_${user.id}_${Date.now()}`;
      this.storeAuth(token, user, credentials.rememberMe || false);

      // Update stored user
      mockUsers.set(credentials.email.toLowerCase(), { ...userData, user });
      this.saveMockUsers(mockUsers);

      return {
        success: true,
        user,
        token,
        message: 'Login successful',
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      await this.fetchApi('/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }

  // Refresh token
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await this.fetchApi<{ user: User; token: string }>(
        '/auth/refresh',
        {
          method: 'POST',
        }
      );

      if (response.success && response.data) {
        const { user, token } = response.data;
        const rememberMe = !!localStorage.getItem(this.tokenKey);
        this.storeAuth(token, user, rememberMe);
        return {
          success: true,
          user,
          token,
        };
      }

      return {
        success: false,
        error: response.message || 'Token refresh failed',
      };
    } catch (error) {
      this.clearAuth();
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

  // Forgot password
  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi('/auth/forgot-password', {
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

  // Reset password
  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi('/auth/reset-password', {
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

  // Verify email
  async verifyEmail(data: VerifyEmailData): Promise<ApiResponse> {
    try {
      const response = await this.fetchApi('/auth/verify-email', {
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

  // Get current user from API
  async getCurrentUser(): Promise<User | null> {
    // In mock mode or if no API URL, return stored user
    if (this.useMockMode || !import.meta.env.VITE_API_URL) {
      return this.getStoredUser();
    }

    // Real API mode
    try {
      const response = await this.fetchApi<User>('/users/me');
      if (response.success && response.data) {
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      // Fallback to stored user if API fails
      return this.getStoredUser();
    }
  }
}

// Export singleton instance
export const authService = new AuthService();

