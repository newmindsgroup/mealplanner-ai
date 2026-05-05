// Authentication Service — uses API client for backend communication
// Hardened with IndexedDB persistence, rate limiting, and account lockout
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

// ─── IndexedDB Persistence Layer ──────────────────────────────────────────────
// Survives localStorage clears, browser restarts, and cookie resets.
const DB_NAME = 'mealplan_auth';
const DB_VERSION = 1;
const STORE_NAME = 'mock_users';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'email' });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function idbGetAll(): Promise<Map<string, { user: User; passwordHash: string }>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();
      req.onsuccess = () => {
        const map = new Map<string, { user: User; passwordHash: string }>();
        (req.result || []).forEach((r: any) => map.set(r.email, { user: r.user, passwordHash: r.passwordHash }));
        resolve(map);
      };
      req.onerror = () => resolve(new Map());
    });
  } catch { return new Map(); }
}

async function idbPut(email: string, data: { user: User; passwordHash: string }): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put({ email, ...data });
  } catch { /* non-fatal */ }
}

async function idbGet(email: string): Promise<{ user: User; passwordHash: string } | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const req = tx.objectStore(STORE_NAME).get(email);
      req.onsuccess = () => {
        const r = req.result;
        resolve(r ? { user: r.user, passwordHash: r.passwordHash } : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch { return null; }
}

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

interface LoginAttemptTracker {
  attempts: number;
  firstAttemptAt: number;
  lockedUntil: number | null;
}

function getAttemptTracker(email: string): LoginAttemptTracker {
  try {
    const key = `login_attempts_${email.toLowerCase()}`;
    const stored = sessionStorage.getItem(key);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return { attempts: 0, firstAttemptAt: 0, lockedUntil: null };
}

function setAttemptTracker(email: string, tracker: LoginAttemptTracker): void {
  try {
    sessionStorage.setItem(`login_attempts_${email.toLowerCase()}`, JSON.stringify(tracker));
  } catch { /* ignore */ }
}

function recordFailedAttempt(email: string): { locked: boolean; remainingMinutes: number } {
  const tracker = getAttemptTracker(email);
  const now = Date.now();

  // Reset if window expired
  if (tracker.firstAttemptAt && now - tracker.firstAttemptAt > LOCKOUT_DURATION_MS) {
    tracker.attempts = 0;
    tracker.firstAttemptAt = 0;
    tracker.lockedUntil = null;
  }

  if (!tracker.firstAttemptAt) tracker.firstAttemptAt = now;
  tracker.attempts++;

  if (tracker.attempts >= MAX_LOGIN_ATTEMPTS) {
    tracker.lockedUntil = now + LOCKOUT_DURATION_MS;
    setAttemptTracker(email, tracker);
    return { locked: true, remainingMinutes: Math.ceil(LOCKOUT_DURATION_MS / 60000) };
  }

  setAttemptTracker(email, tracker);
  return { locked: false, remainingMinutes: 0 };
}

function checkLockout(email: string): { locked: boolean; remainingMinutes: number } {
  const tracker = getAttemptTracker(email);
  if (tracker.lockedUntil) {
    const remaining = tracker.lockedUntil - Date.now();
    if (remaining > 0) {
      return { locked: true, remainingMinutes: Math.ceil(remaining / 60000) };
    }
    // Lockout expired — reset
    setAttemptTracker(email, { attempts: 0, firstAttemptAt: 0, lockedUntil: null });
  }
  return { locked: false, remainingMinutes: 0 };
}

function clearAttempts(email: string): void {
  try { sessionStorage.removeItem(`login_attempts_${email.toLowerCase()}`); } catch { /* ignore */ }
}

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
        clearAttempts(credentials.email);
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
      if (!isMockMode()) {
        await api.post('/auth/logout');
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearTokens();
      this.clearUser();
    }
  }

  // ─── Refresh Token ───────────────────────────────────────────────

  async refreshToken(): Promise<AuthResponse> {
    if (isMockMode()) {
      // In mock mode, just validate stored user still exists
      const user = this.getStoredUser();
      const token = this.getToken();
      if (user && token) return { success: true, user, token };
      return { success: false, error: 'Session expired' };
    }

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
    if (isMockMode()) {
      // In mock mode, we can reset directly
      return { success: true, message: 'If an account exists with that email, you can now set a new password.' };
    }
    try {
      return await api.post('/auth/forgot-password', data);
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  async resetPassword(data: ResetPasswordData): Promise<ApiResponse> {
    if (isMockMode()) {
      return this.resetPasswordMock(data);
    }
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
  // Mock mode helpers — Hardened with IndexedDB + Rate Limiting
  // ═══════════════════════════════════════════════════════════════════

  private async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /** Read mock users from IndexedDB first, then localStorage as fallback */
  private async getMockUsers(): Promise<Map<string, { user: User; passwordHash: string }>> {
    // Primary: IndexedDB (survives localStorage clears)
    const idbUsers = await idbGetAll();
    if (idbUsers.size > 0) return idbUsers;

    // Fallback: localStorage (old data may still be here)
    const stored = localStorage.getItem(this.mockUsersKey);
    if (!stored) return new Map();
    try {
      const parsed = new Map<string, { user: User; passwordHash: string }>(Object.entries(JSON.parse(stored)));
      // Migrate to IndexedDB for durability
      for (const [email, data] of parsed) {
        await idbPut(email, data);
      }
      return parsed;
    } catch { return new Map(); }
  }

  /** Save to both IndexedDB AND localStorage (belt + suspenders) */
  private async saveMockUser(email: string, data: { user: User; passwordHash: string }): Promise<void> {
    // Save to IndexedDB (durable)
    await idbPut(email, data);

    // Also save to localStorage (fast reads on next page load)
    try {
      const existing = localStorage.getItem(this.mockUsersKey);
      const users = existing ? JSON.parse(existing) : {};
      users[email] = data;
      localStorage.setItem(this.mockUsersKey, JSON.stringify(users));
    } catch { /* non-fatal */ }
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

      const email = data.email.toLowerCase();

      // Check IndexedDB first
      const existingIdb = await idbGet(email);
      if (existingIdb) {
        return { success: false, error: 'Email already registered' };
      }

      // Also check localStorage
      const mockUsers = await this.getMockUsers();
      if (mockUsers.has(email)) {
        return { success: false, error: 'Email already registered' };
      }

      const passwordHash = await this.hashPassword(data.password);
      const user: User = {
        id: `mock_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        email,
        name: data.name,
        emailVerified: false,
        createdAt: new Date().toISOString(),
      };

      await this.saveMockUser(email, { user, passwordHash });

      const token = `mock_token_${user.id}_${Date.now()}`;
      storeTokens(token, undefined, true);
      this.storeUser(user, true);

      return { success: true, user, token, message: 'Registration successful' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  private async loginMock(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      if (!credentials.email || !credentials.password) {
        return { success: false, error: 'Email and password are required' };
      }

      const email = credentials.email.toLowerCase();

      // Check lockout
      const lockout = checkLockout(email);
      if (lockout.locked) {
        return { success: false, error: `Account temporarily locked. Try again in ${lockout.remainingMinutes} minute${lockout.remainingMinutes !== 1 ? 's' : ''}.` };
      }

      // Try IndexedDB first (primary), then localStorage (fallback)
      let userData = await idbGet(email);
      if (!userData) {
        // Fallback to localStorage
        const mockUsers = await this.getMockUsers();
        userData = mockUsers.get(email) || null;
      }

      if (!userData) {
        recordFailedAttempt(email);
        return { success: false, error: 'Invalid email or password' };
      }

      const passwordHash = await this.hashPassword(credentials.password);
      if (passwordHash !== userData.passwordHash) {
        const result = recordFailedAttempt(email);
        if (result.locked) {
          return { success: false, error: `Too many failed attempts. Account locked for ${result.remainingMinutes} minutes.` };
        }
        return { success: false, error: 'Invalid email or password' };
      }

      // Success — clear attempt tracker
      clearAttempts(email);

      const user: User = { ...userData.user, lastLogin: new Date().toISOString() };
      const token = `mock_token_${user.id}_${Date.now()}`;
      const rememberMe = credentials.rememberMe || false;

      storeTokens(token, undefined, rememberMe);
      this.storeUser(user, rememberMe);

      // Update last login in storage
      await this.saveMockUser(email, { ...userData, user });

      return { success: true, user, token, message: 'Login successful' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  /** Mock-mode password reset — allows users to set new password by email */
  private async resetPasswordMock(data: ResetPasswordData): Promise<ApiResponse> {
    try {
      if (!data.password || data.password.length < 6) {
        return { success: false, error: 'Password must be at least 6 characters' };
      }

      // In mock mode, the "token" field carries the email address
      const email = (data.token || '').toLowerCase();
      if (!email || !email.includes('@')) {
        return { success: false, error: 'Please enter your email address' };
      }

      const userData = await idbGet(email);
      if (!userData) {
        // Allow re-registration via reset
        return { success: false, error: 'No account found. Please register a new account.' };
      }

      // Update password hash
      const newHash = await this.hashPassword(data.password);
      await this.saveMockUser(email, { user: userData.user, passwordHash: newHash });
      clearAttempts(email);

      return { success: true, message: 'Password reset successful. You can now log in.' };
    } catch (error: any) {
      return { success: false, error: error.message || 'Password reset failed' };
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
