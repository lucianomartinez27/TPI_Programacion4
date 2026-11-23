import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCartStore } from '@/store/cartStore';
import { createPedido } from '@/features/cart/api/cartApi';
import type { FormaPago } from '@/shared/api/types';
import { PEDIDOS_KEY } from '@/features/orders/hooks/useOrders';
import { PRODUCTOS_KEY } from '@/features/catalog/hooks/useCatalog';
import { ADMIN_PEDIDOS_KEY, RESUMEN_KEY } from '@/features/admin/hooks/useAdmin';

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
      void qc.invalidateQueries({ queryKey: PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: ADMIN_PEDIDOS_KEY });
      void qc.invalidateQueries({ queryKey: RESUMEN_KEY });
      void qc.invalidateQueries({ queryKey: PRODUCTOS_KEY });
    },
  });
}
