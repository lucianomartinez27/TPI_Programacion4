import axios from 'axios';

export function handleApiError(error: unknown): string {
  if (!axios.isAxiosError(error)) {
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return 'Ocurrió un error inesperado.';
  }

  if (error.code === 'ECONNABORTED') {
    return 'El servidor tardó demasiado en responder.';
  }

  if (!error.response) {
    return 'No se pudo conectar con el servidor.';
  }

  const { status, data } = error.response;
  const detail = (data as { detail?: unknown } | undefined)?.detail;

  if (status === 401) {
    return typeof detail === 'string'
      ? detail
      : 'La sesión venció. Es necesario iniciar sesión de nuevo.';
  }

  if (status === 403) {
    return 'No tenés permisos para realizar esta acción.';
  }

  if (status === 422) {
    return 'Los datos enviados no son válidos. Revisá los campos.';
  }

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (status < 500) {
    return 'No se pudo completar la operación.';
  }

  return 'Error interno del servidor. Intentá nuevamente más tarde.';
}
