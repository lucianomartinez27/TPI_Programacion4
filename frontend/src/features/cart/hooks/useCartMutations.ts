import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '../../../store/cartStore';
import { createPedido } from '../api/cartApi';
import { throwApiError } from '../../../shared/api/handleApiError';
import type { FormaPago } from '../../../shared/api/types';
import { PEDIDOS_KEY } from '../../orders/hooks/useOrders';
import { PRODUCTOS_KEY } from '../../catalog/hooks/useCatalog';
import { ADMIN_PEDIDOS_KEY, RESUMEN_KEY } from '../../admin/hooks/useAdmin';

export function useCreatePedidoMutation() {
  const qc = useQueryClient();
  const vaciar = useCartStore((s) => s.vaciar);
  return useMutation({
    mutationFn: (data: {
      forma_pago: FormaPago;
      direccion_entrega: string;
      notas?: string;
      items: { producto_id: number; cantidad: number }[];
    }) => createPedido(data),
    onSuccess: () => {
      vaciar();
      qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_KEY });
      qc.invalidateQueries({ queryKey: RESUMEN_KEY });
      qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}
