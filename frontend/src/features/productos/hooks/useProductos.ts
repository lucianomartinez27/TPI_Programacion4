import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productos.api';
import type {
  FiltrosProductos,
  ProductoCreate,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types';

export const PRODUCTOS_KEY = ['productos'] as const;

export function useProductos(filtros: FiltrosProductos = {}) {
  return useQuery({
    queryKey: ['productos', filtros],
    queryFn: () => productosApi.listar(filtros),
  });
}

export function useCrearProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductoCreate) => productosApi.crear(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useActualizarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: ProductoUpdate }) =>
      productosApi.actualizar(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useActualizarStock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: ProductoStockUpdate;
    }) => productosApi.actualizarStock(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}

export function useEliminarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosApi.eliminar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}
