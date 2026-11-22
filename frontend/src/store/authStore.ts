import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRead } from '../shared/api/types';

interface AuthState {
  user: UserRead | null;
  loading: boolean;
  setUser: (user: UserRead | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ loading }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
