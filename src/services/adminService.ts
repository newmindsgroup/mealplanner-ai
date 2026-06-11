/**
 * Admin Service — API client for /api/admin/* endpoints
 * Used exclusively by the Mission Control admin panel.
 */

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

function getHeaders(): HeadersInit {
  const token = localStorage.getItem('auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function request<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}/admin${path}`, {
    ...options,
    headers: { ...getHeaders(), ...(options.headers || {}) },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `Admin API error: ${res.status}`);
  }

  return res.json();
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboard = () => request('/dashboard');

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = (params?: { page?: number; limit?: number; search?: string; role?: string; tier?: string }) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.search) qs.set('search', params.search);
  if (params?.role) qs.set('role', params.role);
  if (params?.tier) qs.set('tier', params.tier);
  return request(`/users?${qs.toString()}`);
};

export const updateUserRole = (userId: string, role: 'user' | 'super_admin') =>
  request(`/users/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) });

export const getUserUsage = (userId: string) =>
  request(`/users/${userId}/usage`);

// ── API Keys ──────────────────────────────────────────────────────────────────
export const getApiKeys = () => request('/api-keys');
export const getApiKeyConsumption = (days?: number) =>
  request(`/api-keys/consumption${days ? `?days=${days}` : ''}`);

// ── Tokenomics ────────────────────────────────────────────────────────────────
export const getTokenomics = (range?: string) =>
  request(`/tokenomics${range ? `?range=${range}` : ''}`);
export const getTokenomicsByUser = () => request('/tokenomics/by-user');
export const getTokenomicsByModel = () => request('/tokenomics/by-model');
export const getTokenomicsForecast = () => request('/tokenomics/forecast');

// ── Health ────────────────────────────────────────────────────────────────────
export const getHealth = () => request('/health');
export const getHealthHistory = (limit?: number) =>
  request(`/health/history${limit ? `?limit=${limit}` : ''}`);
export const getDatabaseHealth = () => request('/health/database');

// ── Audit Logs ────────────────────────────────────────────────────────────────
export const getAuditLogs = (params?: { page?: number; limit?: number; action?: string; actor_id?: string }) => {
  const qs = new URLSearchParams();
  if (params?.page) qs.set('page', String(params.page));
  if (params?.limit) qs.set('limit', String(params.limit));
  if (params?.action) qs.set('action', params.action);
  if (params?.actor_id) qs.set('actor_id', params.actor_id);
  return request(`/audit-logs?${qs.toString()}`);
};

// ── Services ──────────────────────────────────────────────────────────────────
export const getServices = () => request('/services');

export const createService = (data: { name: string; type: string; url?: string; config?: any }) =>
  request('/services', { method: 'POST', body: JSON.stringify(data) });

export const updateService = (id: string, data: Partial<{ name: string; type: string; url: string; status: string; config: any }>) =>
  request(`/services/${id}`, { method: 'PATCH', body: JSON.stringify(data) });

export const deleteService = (id: string) =>
  request(`/services/${id}`, { method: 'DELETE' });

export const healthCheckService = (id: string) =>
  request(`/services/${id}/health-check`, { method: 'POST' });

// ── Config ────────────────────────────────────────────────────────────────────
export const getConfig = () => request('/config');
