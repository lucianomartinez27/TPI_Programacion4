import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias.api';
import type {
  CategoriaCreate,
  CategoriaUpdate,
} from '../types/categoria.types';

export const CATEGORIAS_KEY = ['categorias'] as const;

export function useCategorias() {
  return useQuery({
    queryKey: CATEGORIAS_KEY,
    queryFn: categoriasApi.listar,
  });
}

export function useCrearCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoriaCreate) => categoriasApi.crear(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    },
  });
}

export function useActualizarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoriaUpdate }) =>
      categoriasApi.actualizar(id, payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
      void qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useEliminarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.eliminar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: CATEGORIAS_KEY });
    },
  });
}
