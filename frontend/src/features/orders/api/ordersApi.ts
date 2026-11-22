import api from '../../../shared/api/axiosInstance';
import type { PedidoRead, PedidosPaginados } from '../../../shared/api/types';
import { EstadoPedido } from '../../../shared/api/types';

export async function listPedidos(
  skip = 0,
  limit = 20,
  estado?: EstadoPedido,
): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = { skip, limit };
  if (estado) params.estado = estado;
  const { data } = await api.get<PedidosPaginados>('/pedidos/', { params });
  return data;
}

export async function getPedido(id: number): Promise<PedidoRead> {
  const { data } = await api.get<PedidoRead>(`/pedidos/${id}`);
  return data;
}

export async function cancelarPedido(id: number): Promise<PedidoRead> {
  const { data } = await api.patch<PedidoRead>(`/pedidos/${id}/cancelar`);
  return data;
}
