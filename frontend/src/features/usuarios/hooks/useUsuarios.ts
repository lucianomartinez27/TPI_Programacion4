import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usuariosApi } from '../api/usuarios.api';

export const USUARIOS_KEY = ['usuarios'] as const;

export function useUsuarios() {
  return useQuery({
    queryKey: USUARIOS_KEY,
    queryFn: usuariosApi.listar,
  });
}

export function useActivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.activar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
  });
}

export function useDesactivarUsuario() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => usuariosApi.desactivar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: USUARIOS_KEY });
    },
  });
}
