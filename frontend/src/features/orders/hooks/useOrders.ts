import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { listPedidos, getPedido, cancelarPedido } from '../api/ordersApi';
import { throwApiError } from '../../../shared/api/handleApiError';
import { EstadoPedido } from '../../../shared/api/types';
import { useAuthStore } from '../../../store/authStore';

export const PEDIDOS_KEY = ['pedidos'];

export function usePedidos(skip = 0, limit = 20, estado?: EstadoPedido) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: [...PEDIDOS_KEY, userId, skip, limit, estado],
    queryFn: () => listPedidos(skip, limit, estado),
    enabled: !!userId,
  });
}

export function usePedido(id: number) {
  const userId = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: ['pedido', userId, id],
    queryFn: () => getPedido(id),
    enabled: !!id && !!userId,
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
