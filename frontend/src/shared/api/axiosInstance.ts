import axios, { AxiosError } from 'axios';
import { useAuthStore } from '../../store/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Interceptor: ante 401 fuera de /auth/token y /auth/me, o ante 400 con detail
// «Cuenta de usuario desactivada», limpia el authStore y redirige a /login
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const url = error.config?.url ?? '';
    const detail = error.response?.data?.detail;

    const isAuthCheckOrLogin =
      url.includes('/auth/token') || url.includes('/auth/me');

    const is401OutsideAuth = status === 401 && !isAuthCheckOrLogin;
    const isDeactivated =
      status === 400 && detail === 'Cuenta de usuario desactivada';

    if (is401OutsideAuth || isDeactivated) {
      useAuthStore.getState().logout();
      if (!['/login', '/register'].includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  },
);

export default api;
