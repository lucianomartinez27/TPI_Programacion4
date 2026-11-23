import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Role, UserRead } from '@/shared/api/types';
import { queryClient } from '@/shared/api/queryClient';
import { getMe, login as loginApi, logout as logoutApi } from '@/features/auth/api/authApi';

export type AuthStatus = 'checking' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: UserRead | null;
  loading: boolean;
  status: AuthStatus;
  setUser: (user: UserRead | null) => void;
  hasRole: (...roles: Role[]) => boolean;
  login: (username: string, password: string) => Promise<UserRead>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: true,
      status: 'checking',
      setUser: (user) =>
        set({
          user,
          loading: false,
          status: user ? 'authenticated' : 'unauthenticated',
        }),
      hasRole: (...roles) => {
        const user = get().user;
        return user !== null && roles.includes(user.role);
      },
      login: async (username, password) => {
        try {
          await loginApi(username, password);
          queryClient.clear();
          const user = await getMe();
          set({ user, loading: false, status: 'authenticated' });
          return user;
        } catch (error) {
          set({ loading: false, status: get().user ? 'authenticated' : 'unauthenticated' });
          throw error;
        }
      },
      checkSession: async () => {
        set({ loading: true, status: 'checking' });
        try {
          const user = await getMe();
          set({ user, loading: false, status: 'authenticated' });
        } catch {
          set({ user: null, loading: false, status: 'unauthenticated' });
        }
      },
      clearSession: () => {
        queryClient.clear();
        set({ user: null, loading: false, status: 'unauthenticated' });
      },
      logout: async () => {
        try {
          await logoutApi();
        } catch {
          // Si la sesión ya venció en servidor, igualmente limpiamos el estado local
        } finally {
          queryClient.clear();
          set({ user: null, loading: false, status: 'unauthenticated' });
        }
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
