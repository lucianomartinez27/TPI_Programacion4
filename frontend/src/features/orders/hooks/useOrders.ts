import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPedidos, getPedido, cancelarPedido } from '../api/ordersApi';
import { throwApiError } from '../../../shared/api/handleApiError';
import { EstadoPedido } from '../../../shared/api/types';

export const PEDIDOS_KEY = ['pedidos'];

export function usePedidos(skip = 0, limit = 20, estado?: EstadoPedido) {
  return useQuery({
    queryKey: [...PEDIDOS_KEY, skip, limit, estado],
    queryFn: () => listPedidos(skip, limit, estado),
  });
}

export function usePedido(id: number) {
  return useQuery({
    queryKey: ['pedido', id],
    queryFn: () => getPedido(id),
    enabled: !!id,
  });
}

export function useCancelarPedidoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}
