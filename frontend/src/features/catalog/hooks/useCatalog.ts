import { useQuery } from '@tanstack/react-query';
import { getCategorias, getProducto, listProductos } from '../api/catalogApi';

export const PRODUCTOS_KEY = ['productos'];
export const CATEGORIAS_KEY = ['categorias'];

export function useProductos(skip = 0, limit = 12, search?: string, categoria_id?: number) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, skip, limit, search, categoria_id],
    queryFn: () => listProductos(skip, limit, search, categoria_id),
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: [...PRODUCTOS_KEY, 'detail', id],
    queryFn: () => getProducto(id),
    enabled: Number.isInteger(id) && id > 0,
  });
}

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_KEY,
    queryFn: getCategorias,
  });
}
