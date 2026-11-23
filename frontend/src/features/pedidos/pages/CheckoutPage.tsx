import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useCrearPedido } from '../hooks/usePedidos';
import {
  CheckoutForm,
  type CheckoutFormValues,
} from '../components/CheckoutForm';
import { handleApiError } from '@/shared/api/handleApiError';
import { formatPrecio } from '@/shared/utils/formatters';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const vaciar = useCartStore((s) => s.vaciar);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const crearPedido = useCrearPedido();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Confirmar pedido</h1>
        <EstadoVacio
          titulo="No tenés productos en tu carrito"
          descripcion="Agregá al menos un producto antes de confirmar un pedido."
          accion={
            <Link to="/">
              <Button>Volver al catálogo</Button>
            </Link>
          }
        />
      </div>
    );
  }

  const handleConfirmar = async (values: CheckoutFormValues) => {
    setServerError(null);
    try {
      const pedido = await crearPedido.mutateAsync({
        items: items.map((i) => ({
          producto_id: i.producto_id,
          cantidad: i.cantidad,
        })),
        forma_pago: values.forma_pago,
        direccion_entrega: values.direccion_entrega.trim(),
        notas: values.notas.trim() || null,
      });
      vaciar();
      showNotification(
        `¡Pedido #${pedido.id} confirmado correctamente!`,
        'success',
      );
      navigate('/mis-pedidos', { replace: true });
    } catch (error) {
      setServerError(handleApiError(error));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          to="/carrito"
          className="inline-flex items-center gap-1 text-sm font-medium text-stone-600 hover:text-orange-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al carrito
        </Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Confirmar pedido</h1>
        <p className="text-sm text-stone-500">
          Completá los datos de entrega y elegí tu forma de pago.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <CheckoutForm onSubmit={handleConfirmar} serverError={serverError} />
        </Card>

        <Card className="h-fit space-y-4 p-6">
          <h2 className="text-base font-semibold text-stone-900">
            Tu pedido ({items.length}{' '}
            {items.length === 1 ? 'producto' : 'productos'})
          </h2>
          <ul className="divide-y divide-stone-100 text-sm">
            {items.map((item) => (
              <li
                key={item.producto_id}
                className="flex items-start justify-between gap-2 py-2.5"
              >
                <div>
                  <p className="font-medium text-stone-800">{item.nombre}</p>
                  <p className="text-xs text-stone-500">
                    {item.cantidad} x {formatPrecio(item.precio_unitario)}
                  </p>
                </div>
                <span className="font-semibold text-stone-900">
                  {formatPrecio(item.precio_unitario * item.cantidad)}
                </span>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t border-stone-200 pt-4 text-lg font-bold text-stone-900">
            <span>Total a pagar</span>
            <span className="text-orange-700">{formatPrecio(total)}</span>
          </div>
        </Card>
      </div>
    </div>
  );
}
