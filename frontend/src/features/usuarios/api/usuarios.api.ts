import { axiosInstance } from '@/shared/api/axiosInstance';
import type { UserPublic } from '../types/usuario.types';

export const usuariosApi = {
  listar: async (): Promise<UserPublic[]> => {
    const { data } = await axiosInstance.get<UserPublic[]>('/admin/usuarios');
    return data;
  },

  activar: async (id: number): Promise<UserPublic> => {
    const { data } = await axiosInstance.post<UserPublic>(
      `/admin/usuarios/${id}/activar`,
    );
    return data;
  },

  desactivar: async (id: number): Promise<UserPublic> => {
    const { data } = await axiosInstance.post<UserPublic>(
      `/admin/usuarios/${id}/desactivar`,
    );
    return data;
  },
};
