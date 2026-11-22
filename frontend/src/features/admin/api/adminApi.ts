import api from '../../../shared/api/axiosInstance';
import type { PedidoRead, PedidosPaginados, ResumenPedidos, UsuarioListRead } from '../../../shared/api/types';
import { EstadoPedido } from '../../../shared/api/types';

// Pedidos admin
export async function listAllPedidos(
  skip = 0,
  limit = 20,
  estado?: EstadoPedido,
): Promise<PedidosPaginados> {
  const params: Record<string, string | number> = { skip, limit };
  if (estado) params.estado = estado;
  const { data } = await api.get<PedidosPaginados>('/pedidos/', { params });
  return data;
}

export async function getPedidoAdmin(id: number): Promise<PedidoRead> {
  const { data } = await api.get<PedidoRead>(`/pedidos/admin/${id}`);
  return data;
}

export async function updateEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<PedidoRead> {
  const { data } = await api.patch<PedidoRead>(`/pedidos/${id}/estado`, { estado });
  return data;
}

export async function getResumenPedidos(): Promise<ResumenPedidos> {
  const { data } = await api.get<ResumenPedidos>('/pedidos/resumen');
  return data;
}

// Usuarios admin
export async function listUsers(): Promise<UsuarioListRead[]> {
  const { data } = await api.get<UsuarioListRead[]>('/admin/usuarios/');
  return data;
}

export async function activateUser(userId: number): Promise<UsuarioListRead> {
  const { data } = await api.post<UsuarioListRead>(`/admin/usuarios/${userId}/activar`);
  return data;
}

export async function deactivateUser(userId: number): Promise<UsuarioListRead> {
  const { data } = await api.post<UsuarioListRead>(`/admin/usuarios/${userId}/desactivar`);
  return data;
}
