// Label Analysis API Service — backend-connected label scanning
import type { LabelAnalysis } from '../types';
import type { ApiResponse } from '../types/api';
import { api, isMockMode } from './apiClient';

class LabelApiService {
  // Upload and analyze a food label image
  async analyzeLabel(
    imageFile: File,
    bloodTypes: string[]
  ): Promise<ApiResponse<LabelAnalysis>> {
    if (isMockMode()) {
      return { success: false, error: 'Label analysis requires server connection' };
    }
    try {
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('bloodTypes', JSON.stringify(bloodTypes));
      return await api.upload<LabelAnalysis>('/labels/analyze', formData);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Analyze label from OCR text
  async analyzeText(
    ocrText: string,
    bloodTypes: string[]
  ): Promise<ApiResponse<LabelAnalysis>> {
    if (isMockMode()) {
      return { success: false, error: 'Label analysis requires server connection' };
    }
    try {
      return await api.post<LabelAnalysis>('/labels/analyze-text', { ocrText, bloodTypes });
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get analysis history
  async getHistory(): Promise<ApiResponse<LabelAnalysis[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      return await api.get<LabelAnalysis[]>('/labels');
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Get analysis by ID
  async getAnalysis(id: string): Promise<ApiResponse<LabelAnalysis>> {
    if (isMockMode()) return { success: false, error: 'Not in mock mode' };
    try {
      return await api.get<LabelAnalysis>(`/labels/${id}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const labelApiService = new LabelApiService();
