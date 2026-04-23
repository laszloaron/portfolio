import { create } from 'zustand';
import api from '../lib/axios';

interface User {
  id: string;
  email: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  is_active: boolean;
  is_superuser: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  login: (credentials: any) => Promise<boolean>;
  register: (userData: any) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),

  checkAuth: async () => {
    set({ isLoading: true, error: null });
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return;
    }

    try {
      const response = await api.get('/api/v1/auth/me');
      set({ user: response.data, isAuthenticated: true, isLoading: false });
    } catch (error) {
      console.error('Auth verification failed', error);
      sessionStorage.removeItem('accessToken');
      sessionStorage.removeItem('refreshToken');
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/api/v1/auth/login', credentials);
      const { access_token, refresh_token } = response.data;
      
      // Save tokens in session storage (destroyed when tab closes)
      sessionStorage.setItem('accessToken', access_token);
      sessionStorage.setItem('refreshToken', refresh_token);
      
      // Fetch user profile immediately
      const userResponse = await api.get('/api/v1/auth/me', {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      
      set({ user: userResponse.data, isAuthenticated: true, isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Invalid login credentials';
      set({ error: typeof message === 'string' ? message : 'Login failed', isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/api/v1/auth/register', userData);
      set({ isLoading: false });
      return true;
    } catch (error: any) {
      const message = error.response?.data?.detail || 'Registration failed';
      set({ error: typeof message === 'string' ? message : 'Registration failed', isLoading: false });
      return false;
    }
  },

  logout: () => {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('refreshToken');
    set({ user: null, isAuthenticated: false, error: null });
  },
}));
