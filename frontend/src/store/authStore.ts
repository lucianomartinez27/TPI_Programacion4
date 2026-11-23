import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserRead } from '../shared/api/types';
import { queryClient } from '../shared/api/queryClient';
import { getMe, login as loginApi } from '../features/auth/api/authApi';

interface AuthState {
  user: UserRead | null;
  loading: boolean;
  setUser: (user: UserRead | null) => void;
  login: (username: string, password: string) => Promise<UserRead>;
  checkSession: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: true,
      setUser: (user) => set({ user, loading: false }),
      login: async (username, password) => {
        try {
          await loginApi(username, password);
          queryClient.clear();
          const user = await getMe();
          set({ user, loading: false });
          return user;
        } catch (error) {
          set({ loading: false });
          throw error;
        }
      },
      checkSession: async () => {
        set({ loading: true });
        try {
          const user = await getMe();
          set({ user, loading: false });
        } catch {
          set({ user: null, loading: false });
        }
      },
      logout: () => {
        queryClient.clear();
        set({ user: null, loading: false });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
