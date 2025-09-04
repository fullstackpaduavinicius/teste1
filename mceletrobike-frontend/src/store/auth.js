import { create } from 'zustand';
import { http } from '@/lib/http';

export const useAuth = create((set, get) => ({
  user: null,
  loading: false,

  me: async () => {
    try {
      const { data } = await http.get('/customers/me');
      set({ user: data.user });
      return data;
    } catch {
      set({ user: null });
      return null;
    }
  },

  register: async (payload) => {
    await http.post('/customers/register', payload);
  },

  login: async ({ email, password, guestCart }) => {
    const { data } = await http.post('/customers/login', { email, password, guestCart });
    set({ user: data.user });
    return data;
  },

  logout: async () => {
    await http.post('/customers/logout');
    set({ user: null });
  },
}));
