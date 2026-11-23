import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { pedidosApi } from '../api/pedidos.api';
import type {
  EstadoPedido,
  FiltrosPedidos,
  PedidoCreate,
} from '../types/pedido.types';

export const PEDIDOS_KEY = ['pedidos'] as const;
export const RESUMEN_PEDIDOS_KEY = ['pedidos', 'resumen'] as const;

export function usePedidos(filtros: FiltrosPedidos = {}) {
  return useQuery({
    queryKey: ['pedidos', filtros],
    queryFn: () => pedidosApi.listar(filtros),
  });
}

export function useCrearPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: PedidoCreate) => pedidosApi.crear(payload),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useCambiarEstadoPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      pedidosApi.cambiarEstado(id, estado),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useCancelarPedido() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => pedidosApi.cancelar(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}

export function useResumenPedidos() {
  return useQuery({
    queryKey: RESUMEN_PEDIDOS_KEY,
    queryFn: pedidosApi.obtenerResumen,
  });
}
