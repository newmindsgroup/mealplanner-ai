// Authentication Service — uses API client for backend communication
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
import { api, getToken, storeTokens, clearTokens, isMockMode } from './apiClient';

class AuthService {
  private userKey = 'auth_user';
  private mockUsersKey = 'mock_users';

  // ─── Token / User Storage ────────────────────────────────────────

  getToken(): string | null {
    return getToken();
  }

  getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.userKey) || sessionStorage.getItem(this.userKey);
    if (userStr) {
      try { return JSON.parse(userStr); } catch { return null; }
    }
    return null;
  }

  private storeUser(user: User, rememberMe = true): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.userKey, JSON.stringify(user));
  }

  private clearUser(): void {
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // ─── Register ────────────────────────────────────────────────────

  async register(data: RegisterData): Promise<AuthResponse> {
    if (isMockMode()) return this.registerMock(data);

    try {
      const response = await api.post<{ user: User; token: string; refreshToken?: string }>(
        '/auth/register',
        data
      );

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        storeTokens(token, refreshToken, true);
        this.storeUser(user, true);
        return { success: true, user, token, message: 'Registration successful' };
      }

      return { success: false, error: response.message || 'Registration failed' };
    } catch (error: any) {
      if (error.status === 0) return this.registerMock(data); // Network error fallback
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  // ─── Login ───────────────────────────────────────────────────────

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    if (isMockMode()) return this.loginMock(credentials);

    try {
      const response = await api.post<{ user: User; token: string; refreshToken?: string }>(
        '/auth/login',
        credentials
      );

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        const rememberMe = credentials.rememberMe || false;
        storeTokens(token, refreshToken, rememberMe);
        this.storeUser(user, rememberMe);
        return { success: true, user, token, message: 'Login successful' };
      }

      return { success: false, error: response.message || 'Login failed' };
    } catch (error: any) {
      if (error.status === 0) return this.loginMock(credentials);
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  // ─── Logout ──────────────────────────────────────────────────────

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      this.clearUser();
    }
  }

  // ─── Refresh Token ───────────────────────────────────────────────

  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await api.post<{ user: User; token: string; refreshToken?: string }>(
        '/auth/refresh'
      );

      if (response.success && response.data) {
        const { user, token, refreshToken } = response.data;
        const rememberMe = !!localStorage.getItem('auth_token');
        storeTokens(token, refreshToken, rememberMe);
        this.storeUser(user, rememberMe);
        return { success: true, user, token };
      }

      return { success: false, error: response.message || 'Token refresh failed' };
    } catch (error: any) {
      clearTokens();
      this.clearUser();
      return { success: false, error: error.message || 'Token refresh failed' };
    }
  }

  // ─── Password Reset ──────────────────────────────────────────────

  async forgotPassword(data: ForgotPasswordData): Promise<ApiResponse> {
    try {
      return await api.post('/auth/forgot-password', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      return await api.post('/auth/reset-password', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  // ─── Email Verification ──────────────────────────────────────────

  async verifyEmail(data: VerifyEmailData): Promise<ApiResponse> {
    try {
      return await api.post('/auth/verify-email', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  // ─── Get Current User (from API) ─────────────────────────────────

  async getCurrentUser(): Promise<User | null> {
    if (isMockMode()) return this.getStoredUser();

    try {
      const response = await api.get<User>('/users/me');
      if (response.success && response.data) {
        this.storeUser(response.data);
        return response.data;
      }
      return null;
    } catch {
      return this.getStoredUser();
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // Mock mode helpers (development only — no backend needed)
  // ═══════════════════════════════════════════════════════════════════

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  private getMockUsers(): Map<string, { user: User; passwordHash: string }> {
    const stored = localStorage.getItem(this.mockUsersKey);
    if (!stored) return new Map();
    try {
      return new Map(Object.entries(JSON.parse(stored)));
    } catch { return new Map(); }
  }

  private saveMockUsers(users: Map<string, { user: User; passwordHash: string }>): void {
    localStorage.setItem(this.mockUsersKey, JSON.stringify(Object.fromEntries(users)));
  }

  private async registerMock(data: RegisterData): Promise<AuthResponse> {
    try {
      if (!data.email || !data.password || !data.name) {
        return { success: false, error: 'All fields are required' };
      }
      if (data.password !== data.confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      if (data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      const mockUsers = this.getMockUsers();
      if (mockUsers.has(data.email.toLowerCase())) {
        return { success: false, error: 'Email already registered' };
      }

      const passwordHash = await this.hashPassword(data.password);
      const user: User = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        email: data.email.toLowerCase(),
        name: data.name,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      mockUsers.set(data.email.toLowerCase(), { user, passwordHash });
      this.saveMockUsers(mockUsers);

      const token = `mock_token_${user.id}_${Date.now()}`;
      storeTokens(token, undefined, true);
      this.storeUser(user, true);

      return { success: true, user, token, message: 'Registration successful (mock mode)' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  private async loginMock(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        return { success: false, error: 'Email and password are required' };
      }

      const mockUsers = this.getMockUsers();
      const userData = mockUsers.get(credentials.email.toLowerCase());
      if (!userData) {
        return { success: false, error: 'Invalid email or password' };
      }

      const passwordHash = await this.hashPassword(credentials.password);
      if (passwordHash !== userData.passwordHash) {
        return { success: false, error: 'Invalid email or password' };
      }

      const user: User = { ...userData.user, lastLogin: new Date().toISOString() };
      const token = `mock_token_${user.id}_${Date.now()}`;
      const rememberMe = credentials.rememberMe || false;

      storeTokens(token, undefined, rememberMe);
      this.storeUser(user, rememberMe);

      mockUsers.set(credentials.email.toLowerCase(), { ...userData, user });
      this.saveMockUsers(mockUsers);

      return { success: true, user, token, message: 'Login successful (mock mode)' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
