import type { EstadoPedido } from '@/features/pedidos/types/pedido.types';

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

const estilosPorEstado: Record<
  EstadoPedido,
  { bg: string; label: string }
> = {
  PENDIENTE: {
    bg: 'bg-amber-100 text-amber-800 border-amber-200',
    label: 'Pendiente',
  },
  EN_PREPARACION: {
    bg: 'bg-sky-100 text-sky-800 border-sky-200',
    label: 'En preparación',
  },
  ENTREGADO: {
    bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    label: 'Entregado',
  },
  CANCELADO: {
    bg: 'bg-red-100 text-red-800 border-red-200',
    label: 'Cancelado',
  },
};

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  const { bg, label } = estilosPorEstado[estado];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${bg}`}
    >
      {label}
    </span>
  );
}
