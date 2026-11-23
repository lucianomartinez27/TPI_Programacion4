import type { ReactNode } from 'react';
import { Card } from '@/shared/ui/Card';

interface ResumenCardProps {
  titulo: string;
  valor: string | number;
  descripcion?: string;
  icono: ReactNode;
  colorClass?: string;
}

export function ResumenCard({
  titulo,
  valor,
  descripcion,
  icono,
  colorClass = 'bg-orange-50 text-orange-600',
}: ResumenCardProps) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
            {titulo}
          </p>
          <p className="mt-2 text-3xl font-bold text-stone-900">{valor}</p>
          {descripcion && (
            <p className="mt-1 text-xs text-stone-500">{descripcion}</p>
          )}
        </div>
        <div className={`rounded-xl p-3 ${colorClass}`}>{icono}</div>
      </div>
    </Card>
  );
}
