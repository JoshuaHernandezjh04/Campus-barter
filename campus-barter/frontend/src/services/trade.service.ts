import api from './api';
import { Trade, Message, ApiError } from '../types';

export const tradeService = {
  getUserTrades: async (status?: string): Promise<Trade[]> => {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      
      const response = await api.get<Trade[]>('/trades', { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch trades' };
    }
  },
  
  getTradeById: async (id: number): Promise<Trade> => {
    try {
      const response = await api.get<Trade>(`/trades/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch trade' };
    }
  },
  
  createTrade: async (
    recipientId: number, 
    offeredItems: number[], 
    requestedItems: number[],
    message?: string
  ): Promise<Trade> => {
    try {
      const response = await api.post<{message: string, trade: Trade}>('/trades', {
        recipient_id: recipientId,
        offered_items: offeredItems,
        requested_items: requestedItems,
        message
      });
      return response.data.trade;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to create trade' };
    }
  },
  
  updateTradeStatus: async (id: number, status: 'accepted' | 'rejected' | 'completed'): Promise<Trade> => {
    try {
      const response = await api.put<{message: string, trade: Trade}>(`/trades/${id}`, { status });
      return response.data.trade;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update trade status' };
    }
  },
  
  sendMessage: async (tradeId: number, content: string): Promise<Message> => {
    try {
      const response = await api.post<{message: string, trade_message: Message}>(
        `/trades/${tradeId}/messages`, 
        { content }
      );
      return response.data.trade_message;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to send message' };
    }
  }
};
