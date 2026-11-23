import { AlertTriangle } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface EstadoErrorProps {
  mensaje: string;
  onReintentar?: () => void;
}

export function EstadoError({ mensaje, onReintentar }: EstadoErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-red-200 bg-red-50/70 px-6 py-10 text-center">
      <AlertTriangle className="mb-3 h-8 w-8 text-red-600" />
      <h3 className="text-base font-semibold text-red-900">
        No se pudo cargar la información
      </h3>
      <p className="mt-1 max-w-md text-sm text-red-700">{mensaje}</p>
      {onReintentar && (
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={onReintentar}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}
