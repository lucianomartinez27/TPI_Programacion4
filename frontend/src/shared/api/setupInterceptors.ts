import type { AxiosError } from 'axios';
import { api } from '@/shared/api/axiosInstance';
import { useAuthStore } from '@/store/authStore';

let initialized = false;

/**
 * Registra los interceptores de respuesta de Axios una sola vez desde main.tsx,
 * evitando importaciones circulares entre axiosInstance y authStore.
 */
export function setupInterceptors() {
  if (initialized) return;
  initialized = true;

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ detail?: string }>) => {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      const detail = error.response?.data?.detail;

      const isAuthCheckOrLogin =
        url.includes('/auth/token') || url.includes('/auth/me') || url.includes('/auth/logout');

      const is401OutsideAuth = status === 401 && !isAuthCheckOrLogin;
      const isDeactivated =
        status === 400 && detail === 'Cuenta de usuario desactivada';

      if (is401OutsideAuth || isDeactivated) {
        if (isDeactivated) {
          void useAuthStore.getState().logout();
        } else {
          useAuthStore.getState().clearSession();
        }
      }

      return Promise.reject(error);
    },
  );
}
