import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateUser,
  deactivateUser,
  getResumenPedidos,
  listAllPedidos,
  listUsers,
  updateEstadoPedido,
} from '../api/adminApi';
import {
  createCategoria,
  createProducto,
  deleteCategoria,
  deleteProducto,
  listAllCategorias,
  updateCategoria,
  updateProducto,
  updateStock,
} from '../../catalog/api/catalogApi';
import { EstadoPedido } from '../../../shared/api/types';
import { CATEGORIAS_KEY, PRODUCTOS_KEY } from '../../catalog/hooks/useCatalog';
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
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: RESUMEN_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
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
      void qc.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
  });
}

export function useDeactivateUserMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deactivateUser(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_KEY });
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
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useUpdateProductoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdatePayload }) =>
      updateProducto(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useUpdateStockMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, stock, disponible }: { id: number; stock: number; disponible?: boolean }) =>
      updateStock(id, { stock, disponible }),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useDeleteProductoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteProducto(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
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
    mutationFn: (data: { nombre: string; descripcion?: string }) => createCategoria(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    },
  });
}

export function useUpdateCategoriaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: { nombre?: string; descripcion?: string; activo?: boolean };
    }) => updateCategoria(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useDeleteCategoriaMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteCategoria(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}
