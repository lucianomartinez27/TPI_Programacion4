import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { handleApiError } from '../api/handleApiError';

interface EstadoErrorProps {
  error?: unknown;
  message?: string;
  onRetry?: () => void;
}

export function EstadoError({ error, message, onRetry }: EstadoErrorProps) {
  const displayMessage = message ?? (error ? handleApiError(error) : 'No pudimos cargar los datos');

  return (
    <div
      role="alert"
      className="bg-red-50 border border-red-200 rounded-xl p-6 text-center"
    >
      <AlertCircle className="h-10 w-10 text-error mx-auto mb-3" />
      <h3 className="text-base font-semibold text-red-800">Ocurrió un error</h3>
      <p className="text-sm text-red-700 mt-1">{displayMessage}</p>
      {onRetry && (
        <div className="mt-4">
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reintentar
          </Button>
        </div>
      )}
    </div>
  );
}
