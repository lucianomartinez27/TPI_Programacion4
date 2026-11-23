import type { AxiosError } from 'axios';
import { axiosInstance } from './axiosInstance';
import { useAuthStore } from '@/store/authStore';

const RUTAS_AUTH_EXCLUIDAS = ['/auth/token', '/auth/me'];

let interceptorRegistrado = false;

export function setupInterceptors(): void {
  if (interceptorRegistrado) return;
  interceptorRegistrado = true;

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError<{ detail?: unknown }>) => {
      const status = error.response?.status;
      const url = error.config?.url ?? '';
      const detail = error.response?.data?.detail;
      const esRutaAuth = RUTAS_AUTH_EXCLUIDAS.some((ruta) =>
        url.includes(ruta),
      );

      const sesionVencida = status === 401 && !esRutaAuth;
      const cuentaDesactivada =
        status === 400 && detail === 'Cuenta de usuario desactivada';

      if (sesionVencida || cuentaDesactivada) {
        useAuthStore.getState().clearSession();
      }

      return Promise.reject(error);
    },
  );
}
