import { AxiosError } from 'axios';
import { QueryClient } from '@tanstack/react-query';

/**
 * Convierte el `detail` de la API en un mensaje legible para la pantalla.
 */
export function handleApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const detail = error.response?.data?.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((d: any) => d.msg || String(d)).join(', ');
    }
    return error.message || 'Error de comunicación con el servidor';
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'Ha ocurrido un error inesperado';
}

/**
 * Crea una función que lanza un error con el mensaje formateado,
 * útil dentro de mutations de TanStack Query.
 */
export function throwApiError(error: unknown): never {
  throw new Error(handleApiError(error));
}
