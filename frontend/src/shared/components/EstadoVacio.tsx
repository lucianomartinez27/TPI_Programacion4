import type { ReactNode } from 'react';
import { Package } from 'lucide-react';

interface EstadoVacioProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export function EstadoVacio({
  title,
  description,
  icon,
  action,
}: EstadoVacioProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 text-center py-12 px-6">
      <div className="flex justify-center mb-3 text-gray-300">
        {icon ?? <Package className="h-12 w-12" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-700">{title}</h3>
      {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  );
}
