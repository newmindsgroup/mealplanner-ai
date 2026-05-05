// Shared API Client — used by all frontend services to communicate with the backend
// Handles auth token injection, error handling, token refresh, and mock mode fallback

import type { ApiResponse } from '../types/api';
import { ApiErrorClass } from '../types/api';
import { getApiUrl } from '../config';

// Token management
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'auth_refresh_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY) || sessionStorage.getItem(REFRESH_TOKEN_KEY);
}

export function storeTokens(token: string, refreshToken?: string, rememberMe = true): void {
  const storage = rememberMe ? localStorage : sessionStorage;
  storage.setItem(TOKEN_KEY, token);
  if (refreshToken) {
    storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  sessionStorage.removeItem(REFRESH_TOKEN_KEY);
}

// Check if we're in mock mode (no backend configured)
export function isMockMode(): boolean {
  const apiUrl = getApiUrl();
  // Mock mode when no API URL is set or it's just the default '/api' fallback without a real server
  return !import.meta.env.VITE_API_URL && import.meta.env.DEV;
}

// Core fetch wrapper with auth, error handling, and token refresh
let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${getApiUrl()}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data.success && data.data?.token) {
      const rememberMe = !!localStorage.getItem(TOKEN_KEY);
      storeTokens(data.data.token, data.data.refreshToken, rememberMe);
      return data.data.token;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Make an authenticated API request to the backend.
 * 
 * - Automatically injects the JWT Bearer token
 * - Handles 401s by attempting a token refresh
 * - Returns typed ApiResponse<T>
 * - Throws ApiErrorClass on failure
 */
export async function apiFetch<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const apiUrl = getApiUrl();
  const url = `${apiUrl}${endpoint}`;
  const token = getToken();

  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  // Only set Content-Type for JSON requests (not for FormData uploads)
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    let response = await fetch(url, { ...options, headers });

    // Handle 401 — attempt token refresh
    if (response.status === 401 && token) {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshAccessToken();
      }

      const newToken = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (newToken) {
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, { ...options, headers });
      } else {
        // Refresh failed — clear auth
        clearTokens();
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
        throw new ApiErrorClass('Session expired. Please log in again.', 401);
      }
    }

    const data = await response.json();

    if (!response.ok) {
      throw new ApiErrorClass(
        data.error || data.message || 'An error occurred',
        response.status,
        data.errors
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiErrorClass) {
      throw error;
    }
    // Network errors
    throw new ApiErrorClass(
      error instanceof Error ? error.message : 'Network error — check your connection',
      0
    );
  }
}

/**
 * Upload a file to the backend via multipart/form-data.
 */
export async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData
): Promise<ApiResponse<T>> {
  return apiFetch<T>(endpoint, {
    method: 'POST',
    body: formData,
  });
}

/**
 * Convenience helpers for common HTTP methods
 */
export const api = {
  get: <T = any>(endpoint: string) => apiFetch<T>(endpoint),

  post: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T = any>(endpoint: string, body?: any) =>
    apiFetch<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    }),

  upload: <T = any>(endpoint: string, formData: FormData) =>
    apiUpload<T>(endpoint, formData),
};
