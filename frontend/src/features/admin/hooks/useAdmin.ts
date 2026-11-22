import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResumenPedidos, listAllPedidos, updateEstadoPedido, listUsers, activateUser, deactivateUser } from '../api/adminApi';
import { createProducto, updateProducto, updateStock, deleteProducto, createCategoria, updateCategoria, deleteCategoria, listAllCategorias } from '../../catalog/api/catalogApi';
import { throwApiError } from '../../../shared/api/handleApiError';
import { EstadoPedido } from '../../../shared/api/types';
import { PRODUCTOS_KEY, CATEGORIAS_KEY } from '../../catalog/hooks/useCatalog';
import { PEDIDOS_KEY } from '../../orders/hooks/useOrders';

export const RESUMEN_KEY = ['resumen'];
export const ADMIN_PEDIDOS_KEY = ['admin', 'pedidos'];
export const USUARIOS_KEY = ['usuarios'];

export function useResumenPedidos() {
  return useQuery({
    queryKey: RESUMEN_KEY,
    queryFn: getResumenPedidos,
  });
}

export function useAdminPedidos(skip = 0, limit = 20, estado?: EstadoPedido) {
  return useQuery({
    queryKey: [...ADMIN_PEDIDOS_KEY, skip, limit, estado],
    queryFn: () => listAllPedidos(skip, limit, estado),
  });
}

export function useUpdateEstadoPedidoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      updateEstadoPedido(id, estado),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_KEY });
      qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      qc.invalidateQueries({ queryKey: RESUMEN_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

// Usuarios
export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_KEY,
    queryFn: listUsers,
  });
}

export function useActivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => activateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

// Productos admin
export interface ProductoCreatePayload {
  categoria_id: number;
  nombre: string;
  descripcion?: string;
  precio_base: number;
  imagen_url?: string;
  stock: number;
  disponible?: boolean;
}

export interface ProductoUpdatePayload {
  categoria_id?: number;
  nombre?: string;
  descripcion?: string;
  precio_base?: number;
  imagen_url?: string;
  stock?: number;
  disponible?: boolean;
  activo?: boolean;
}

export function useCreateProductoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductoCreatePayload) => createProducto(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useUpdateProductoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdatePayload }) =>
      updateProducto(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useUpdateStockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible?: boolean }) =>
      updateStock(id, { stock, disponible }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useDeleteProductoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

// Categorías admin
export function useAllCategorias() {
  return useQuery({
    queryKey: [...CATEGORIAS_KEY, 'admin'],
    queryFn: listAllCategorias,
  });
}

export function useCreateCategoriaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; descripcion?: string }) =>
      createCategoria(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useUpdateCategoriaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre?: string; descripcion?: string; activo?: boolean } }) =>
      updateCategoria(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}

export function useDeleteCategoriaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}
