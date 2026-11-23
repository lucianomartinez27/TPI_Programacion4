import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authApi } from '@/features/auth/api/auth.api';
import type { Role, UserPublic } from '@/features/auth/types/auth.types';

interface AuthState {
  usuario: UserPublic | null;
  cargando: boolean;
  login: (username: string, password: string) => Promise<UserPublic>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  clearSession: () => void;
  hasRole: (...roles: Role[]) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      usuario: null,
      cargando: true,

      login: async (username, password) => {
        await authApi.login({ username, password });
        const usuario = await authApi.me();
        set({ usuario, cargando: false });
        return usuario;
      },

      logout: async () => {
        try {
          await authApi.logout();
        } finally {
          set({ usuario: null, cargando: false });
        }
      },

      checkSession: async () => {
        set({ cargando: true });
        try {
          const usuario = await authApi.me();
          set({ usuario, cargando: false });
        } catch {
          set({ usuario: null, cargando: false });
        }
      },

      clearSession: () => {
        set({ usuario: null, cargando: false });
      },

      hasRole: (...roles) => {
        const usuario = get().usuario;
        return usuario !== null && roles.includes(usuario.role);
      },
    }),
    {
      name: 'foodstore-auth',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({ usuario: state.usuario }),
    },
  ),
);
