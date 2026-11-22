import { useMutation } from '@tanstack/react-query';
import { useCartStore } from '../../../store/cartStore';
import { createPedido } from '../api/cartApi';
import { throwApiError } from '../../../shared/api/handleApiError';

export function useCreatePedidoMutation() {
  const vaciar = useCartStore((s) => s.vaciar);
  return useMutation({
    mutationFn: (data: {
      forma_pago: string;
      direccion_entrega: string;
      notas?: string;
      items: { producto_id: number; cantidad: number }[];
    }) => createPedido(data),
    onSuccess: () => {
      vaciar();
    },
    onError: (error) => {
      throwApiError(error);
    },
  });
}
