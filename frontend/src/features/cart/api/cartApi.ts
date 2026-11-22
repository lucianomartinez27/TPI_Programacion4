import api from '../../../shared/api/axiosInstance';
import type { PedidoRead, PedidosPaginados, ResumenPedidos } from '../../../shared/api/types';
import { EstadoPedido, FormaPago } from '../../../shared/api/types';

export interface PedidoCreateData {
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string;
  items: { producto_id: number; cantidad: number }[];
}

export async function createPedido(data: PedidoCreateData): Promise<PedidoRead> {
  const { data: result } = await api.post<PedidoRead>('/pedidos/', data);
  return result;
}

export async function listPedidos(
  skip = 0,
  limit = 20,
  estado?: EstadoPedido,
): Promise<PedidosPaginados> {
  const params: Record<string, any> = { skip, limit };
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

// Admin
export async function updateEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<PedidoRead> {
  const { data } = await api.patch<PedidoRead>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function getPedidoAdmin(id: number): Promise<PedidoRead> {
  const { data } = await api.get<PedidoRead>(`/pedidos/admin/${id}`);
  return data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen');
  return data;
}
