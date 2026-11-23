import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cancelarPedido, getPedido, listPedidos } from '@/features/orders/api/ordersApi';
import { EstadoPedido } from '@/shared/api/types';
import { useAuthStore } from '@/store/authStore';
import { PRODUCTOS_KEY } from '@/features/catalog/hooks/useCatalog';

export const PEDIDOS_KEY = ['pedidos'];
const ADMIN_PEDIDOS_KEY = ['admin', 'pedidos'];
const RESUMEN_KEY = ['resumen'];

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
    queryKey: [...PEDIDOS_KEY, 'detail', userId, id],
    queryFn: () => getPedido(id),
    enabled: Number.isInteger(id) && id > 0 && !!userId,
  });
}

export function useCancelarPedidoMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => cancelarPedido(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: RESUMEN_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}
