// Chat API Service — backend-connected chat with server-side AI processing
import type { ChatMessage, Person, WeeklyPlan, KnowledgeBaseFile } from '../types';
import type { ApiResponse } from '../types/api';
import { api, isMockMode } from './apiClient';
import { chatWithAssistant } from './chatService';

class ChatApiService {
  // Send a message — prefer server-side AI, fallback to client-side
  async sendMessage(
    userMessage: string,
    context?: {
      people?: Person[];
      currentPlan?: WeeklyPlan;
      knowledgeBase?: KnowledgeBaseFile[];
    }
  ): Promise<ApiResponse<{ response: string }>> {
    // In mock mode or when server is unavailable, use client-side AI
    if (isMockMode()) {
      try {
        const response = await chatWithAssistant(userMessage, context);
        return { success: true, data: { response } };
      } catch (error: any) {
        return { success: false, error: error.message };
      }
    }

    try {
      const response = await api.post<{ response: string; sessionId?: string }>('/chat', {
        message: userMessage,
        context: {
          peopleIds: context?.people?.map(p => p.id),
          planId: context?.currentPlan?.id,
        },
      });
      return response;
    } catch (error: any) {
      // If server fails, try client-side AI as fallback
      console.warn('Server chat failed, trying client-side AI:', error.message);
      try {
        const response = await chatWithAssistant(userMessage, context);
        return { success: true, data: { response } };
      } catch (fallbackError: any) {
        return { success: false, error: fallbackError.message };
      }
    }
  }

  // Get chat history
  async getHistory(sessionId?: string): Promise<ApiResponse<ChatMessage[]>> {
    if (isMockMode()) return { success: true, data: [] };
    try {
      const query = sessionId ? `?sessionId=${sessionId}` : '';
      return await api.get<ChatMessage[]>(`/chat/history${query}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Clear chat history
  async clearHistory(sessionId?: string): Promise<ApiResponse> {
    if (isMockMode()) return { success: true };
    try {
      return await api.delete(`/chat/history${sessionId ? `/${sessionId}` : ''}`);
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}

export const chatApiService = new ChatApiService();
