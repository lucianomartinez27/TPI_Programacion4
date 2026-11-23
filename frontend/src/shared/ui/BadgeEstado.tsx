import { EstadoPedido } from '@/shared/api/types';

interface BadgeEstadoProps {
  estado: EstadoPedido;
}

const estilos: Record<EstadoPedido, string> = {
  [EstadoPedido.PENDIENTE]: 'bg-yellow-100 text-yellow-800',
  [EstadoPedido.EN_PREPARACION]: 'bg-blue-100 text-blue-800',
  [EstadoPedido.ENTREGADO]: 'bg-green-100 text-green-800',
  [EstadoPedido.CANCELADO]: 'bg-red-100 text-red-800',
};

const labels: Record<EstadoPedido, string> = {
  [EstadoPedido.PENDIENTE]: 'Pendiente',
  [EstadoPedido.EN_PREPARACION]: 'En preparación',
  [EstadoPedido.ENTREGADO]: 'Entregado',
  [EstadoPedido.CANCELADO]: 'Cancelado',
};

export function BadgeEstado({ estado }: BadgeEstadoProps) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${estilos[estado]}`}>
      {labels[estado]}
    </span>
  );
}
