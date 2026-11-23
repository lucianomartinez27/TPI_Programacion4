import type { ReactNode } from 'react';
import { PackageOpen } from 'lucide-react';

interface EstadoVacioProps {
  titulo: string;
  descripcion?: string;
  accion?: ReactNode;
}

export function EstadoVacio({
  titulo,
  descripcion,
  accion,
}: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-stone-300 bg-white px-6 py-14 text-center">
      <div className="mb-4 rounded-full bg-orange-50 p-4 text-orange-600">
        <PackageOpen className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold text-stone-900">{titulo}</h3>
      {descripcion && (
        <p className="mt-1 max-w-md text-sm text-stone-500">{descripcion}</p>
      )}
      {accion && <div className="mt-5">{accion}</div>}
    </div>
  );
}
