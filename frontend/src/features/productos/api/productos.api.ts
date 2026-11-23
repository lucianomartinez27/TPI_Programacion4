import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  FiltrosProductos,
  Producto,
  ProductoCreate,
  ProductosPaginados,
  ProductoStockUpdate,
  ProductoUpdate,
} from '../types/producto.types';

export const productosApi = {
  listar: async (filtros: FiltrosProductos = {}): Promise<ProductosPaginados> => {
    const params: Record<string, string | number | boolean> = {};
    if (filtros.skip !== undefined) params.skip = filtros.skip;
    if (filtros.limit !== undefined) params.limit = filtros.limit;
    if (filtros.search && filtros.search.trim()) {
      params.search = filtros.search.trim();
    }
    if (filtros.categoria_id !== undefined) {
      params.categoria_id = filtros.categoria_id;
    }
    if (filtros.disponible !== undefined) {
      params.disponible = filtros.disponible;
    }

    const { data } = await axiosInstance.get<ProductosPaginados>('/productos', {
      params,
    });
    return data;
  },

  obtener: async (id: number): Promise<Producto> => {
    const { data } = await axiosInstance.get<Producto>(`/productos/${id}`);
    return data;
  },

  crear: async (payload: ProductoCreate): Promise<Producto> => {
    const { data } = await axiosInstance.post<Producto>('/productos', payload);
    return data;
  },

  actualizar: async (
    id: number,
    payload: ProductoUpdate,
  ): Promise<Producto> => {
    const { data } = await axiosInstance.put<Producto>(
      `/productos/${id}`,
      payload,
    );
    return data;
  },

  actualizarStock: async (
    id: number,
    payload: ProductoStockUpdate,
  ): Promise<Producto> => {
    const { data } = await axiosInstance.patch<Producto>(
      `/productos/${id}/stock`,
      payload,
    );
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/productos/${id}`);
  },
};
