import { axiosInstance } from '@/shared/api/axiosInstance';
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria.types';

export const categoriasApi = {
  listar: async (): Promise<Categoria[]> => {
    const { data } = await axiosInstance.get<Categoria[]>('/categorias');
    return data;
  },

  obtener: async (id: number): Promise<Categoria> => {
    const { data } = await axiosInstance.get<Categoria>(`/categorias/${id}`);
    return data;
  },

  crear: async (payload: CategoriaCreate): Promise<Categoria> => {
    const { data } = await axiosInstance.post<Categoria>('/categorias', payload);
    return data;
  },

  actualizar: async (
    id: number,
    payload: CategoriaUpdate,
  ): Promise<Categoria> => {
    const { data } = await axiosInstance.put<Categoria>(
      `/categorias/${id}`,
      payload,
    );
    return data;
  },

  eliminar: async (id: number): Promise<void> => {
    await axiosInstance.delete(`/categorias/${id}`);
  },
};
