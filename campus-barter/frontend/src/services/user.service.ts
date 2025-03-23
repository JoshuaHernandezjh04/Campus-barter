import api from './api';
import { User, ApiError } from '../types';

export const userService = {
  getUserById: async (id: number): Promise<User> => {
    try {
      const response = await api.get<User>(`/users/${id}`);
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch user' };
    }
  },
  
  updateUserProfile: async (id: number, userData: Partial<User>): Promise<User> => {
    try {
      const response = await api.put<{message: string, user: User}>(`/users/${id}`, userData);
      
      // Update stored user data if it's the current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser.id === id) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data.user;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to update user profile' };
    }
  },
  
  getUserItems: async (id: number, status?: string): Promise<any[]> => {
    try {
      const params: Record<string, string> = {};
      if (status) params.status = status;
      
      const response = await api.get<any[]>(`/users/${id}/items`, { params });
      return response.data;
    } catch (error: any) {
      throw error.response?.data || { error: 'Failed to fetch user items' };
    }
  }
};
