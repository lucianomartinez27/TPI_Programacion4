import { EstadoPedido, FormaPago } from '@/shared/api/types';

export const estadoPedidoLabel: Record<EstadoPedido, string> = {
  [EstadoPedido.PENDIENTE]: 'Pendiente',
  [EstadoPedido.EN_PREPARACION]: 'En preparación',
  [EstadoPedido.ENTREGADO]: 'Entregado',
  [EstadoPedido.CANCELADO]: 'Cancelado',
};

export const formaPagoLabel: Record<FormaPago, string> = {
  [FormaPago.EFECTIVO]: 'Efectivo',
  [FormaPago.TRANSFERENCIA]: 'Transferencia',
};
