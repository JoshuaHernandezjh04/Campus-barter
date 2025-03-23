import api from './api';
import { Item, ApiError } from '../types';

export const itemService = {
  getAllItems: async (category?: string, status: string = 'available'): Promise<Item[]> => {
    try {
      let url = '/items';
      const params: Record<string, string> = {};
      
      if (category) params.category = category;
      if (status) params.status = status;
      
      const response = await api.get<Item[]>(url, { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch items' };
    }
  },
  
  getItemById: async (id: number): Promise<Item> => {
    try {
      const response = await api.get<Item>(`/items/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch item' };
    }
  },
  
  createItem: async (itemData: Omit<Item, 'id' | 'user_id' | 'date_listed' | 'status'>): Promise<Item> => {
    try {
      const response = await api.post<{message: string, item: Item}>('/items', itemData);
      return response.data.item;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to create item' };
    }
  },
  
  updateItem: async (id: number, itemData: Partial<Item>): Promise<Item> => {
    try {
      const response = await api.put<{message: string, item: Item}>(`/items/${id}`, itemData);
      return response.data.item;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update item' };
    }
  },
  
  deleteItem: async (id: number): Promise<void> => {
    try {
      await api.delete(`/items/${id}`);
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to delete item' };
    }
  },
  
  getCategories: async (): Promise<string[]> => {
    try {
      const response = await api.get<string[]>('/items/categories');
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch categories' };
    }
  }
};
