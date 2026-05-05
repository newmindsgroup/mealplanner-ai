// Lab API Service — backend-connected lab report management
import type { LabReport, LabResult, LabAlert, LabInsight, LabTrend, LabAnalyticsSummary } from '../types/labs';
import type { ApiResponse } from '../types/api';
import { api, isMockMode } from './apiClient';

class LabApiService {
  // ─── Reports ─────────────────────────────────────────────────────

  async getReports(memberId?: string): Promise<ApiResponse<LabReport[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      const query = memberId ? `?memberId=${memberId}` : '';
      return await api.get<LabReport[]>(`/labs/reports${query}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getReport(id: string): Promise<ApiResponse<LabReport>> {
    if (isMockMode()) return { success: false, error: 'Not available in mock mode' };
    try {
      return await api.get<LabReport>(`/labs/reports/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async addReport(report: Omit<LabReport, 'id'>): Promise<ApiResponse<LabReport>> {
    if (isMockMode()) {
      const mockReport: LabReport = { ...report as any, id: crypto.randomUUID() };
      return { success: true, data: mockReport };
    }
    try {
      return await api.post<LabReport>('/labs/reports', report);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async updateReport(id: string, updates: Partial<LabReport>): Promise<ApiResponse<LabReport>> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch<LabReport>(`/labs/reports/${id}`, updates);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async deleteReport(id: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.delete(`/labs/reports/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Upload lab report file
  async uploadReport(file: File, memberId: string): Promise<ApiResponse<LabReport>> {
    if (isMockMode()) return { success: false, error: 'Not available in mock mode' };
    try {
      const formData = new FormData();
      formData.append('report', file);
      formData.append('memberId', memberId);
      return await api.upload<LabReport>('/labs/reports/upload', formData);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Results ─────────────────────────────────────────────────────

  async updateResult(reportId: string, resultId: string, updates: Partial<LabResult>): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch(`/labs/reports/${reportId}/results/${resultId}`, updates);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Alerts ──────────────────────────────────────────────────────

  async getAlerts(memberId?: string): Promise<ApiResponse<LabAlert[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      const query = memberId ? `?memberId=${memberId}` : '';
      return await api.get<LabAlert[]>(`/labs/alerts${query}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async acknowledgeAlert(alertId: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch(`/labs/alerts/${alertId}/acknowledge`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Insights ────────────────────────────────────────────────────

  async getInsights(memberId: string): Promise<ApiResponse<LabInsight[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get<LabInsight[]>(`/labs/insights?memberId=${memberId}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async dismissInsight(insightId: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.patch(`/labs/insights/${insightId}/dismiss`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // ─── Analytics ───────────────────────────────────────────────────

  async getTrends(memberId: string, testName: string): Promise<ApiResponse<LabTrend>> {
    if (isMockMode()) return { success: true, data: undefined as any };
    try {
      return await api.get<LabTrend>(`/labs/trends/${memberId}/${encodeURIComponent(testName)}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async getSummary(memberId: string): Promise<ApiResponse<LabAnalyticsSummary>> {
    if (isMockMode()) return { success: true, data: undefined as any };
    try {
      return await api.get<LabAnalyticsSummary>(`/labs/summary/${memberId}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const labApiService = new LabApiService();
