import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';

interface PaginacionProps {
  page: number;
  totalPages: number;
  onPageChange: (nextPage: number) => void;
  className?: string;
}

export function Paginacion({
  page,
  totalPages,
  onPageChange,
  className = '',
}: PaginacionProps) {
  if (totalPages <= 1) return null;

  return (
    <div className={`flex items-center justify-center gap-3 ${className}`}>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(Math.max(0, page - 1))}
        disabled={page === 0}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Anterior
      </Button>
      <span className="text-sm text-gray-600">
        Página {page + 1} de {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
        disabled={page >= totalPages - 1}
      >
        Siguiente
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}
