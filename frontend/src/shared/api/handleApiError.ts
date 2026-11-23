import axios from 'axios';

interface ApiErrorPayload {
  detail?: string | Array<{ msg?: string }>;
}

/**
 * Convierte errores de Axios / red / validación FastAPI en mensajes legibles.
 */
export function handleApiError(error: unknown): string {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    if (error.code === 'ECONNABORTED') {
      return 'La solicitud tardó demasiado tiempo. Intentá nuevamente.';
    }
    if (!error.response) {
      return 'No se pudo conectar con el servidor. Verificá tu conexión.';
    }

    const { status, data } = error.response;
    const detail = data?.detail;

    if (typeof detail === 'string' && detail.trim().length > 0) {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((d) => d.msg ?? String(d))
        .join(', ');
    }

    switch (status) {
      case 401:
        return 'Tu sesión venció o las credenciales son inválidas.';
      case 403:
        return 'No tenés permisos para realizar esta acción.';
      case 404:
        return 'El recurso solicitado no fue encontrado.';
      case 409:
        return 'Ya existe un registro con los mismos datos.';
      case 422:
        return 'Los datos enviados no son válidos.';
      default:
        if (status >= 500) {
          return 'Error interno del servidor. Intentá más tarde.';
        }
        return 'No se pudo completar la solicitud.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ha ocurrido un error inesperado.';
}
