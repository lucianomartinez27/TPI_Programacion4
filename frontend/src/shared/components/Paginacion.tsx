import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

interface PaginacionProps {
  paginaActual: number;
  totalItems: number;
  porPagina: number;
  onCambiarPagina: (nuevaPagina: number) => void;
}

export function Paginacion({
  paginaActual,
  totalItems,
  porPagina,
  onCambiarPagina,
}: PaginacionProps) {
  const totalPaginas = Math.max(1, Math.ceil(totalItems / porPagina));
  if (totalPaginas <= 1) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-stone-200 pt-4">
      <p className="text-sm text-stone-600">
        Mostrando página <span className="font-semibold">{paginaActual + 1}</span>{' '}
        de <span className="font-semibold">{totalPaginas}</span> ({totalItems}{' '}
        resultados)
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          disabled={paginaActual === 0}
          onClick={() => onCambiarPagina(paginaActual - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          Anterior
        </Button>
        <Button
          variant="secondary"
          size="sm"
          disabled={paginaActual + 1 >= totalPaginas}
          onClick={() => onCambiarPagina(paginaActual + 1)}
        >
          Siguiente
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
