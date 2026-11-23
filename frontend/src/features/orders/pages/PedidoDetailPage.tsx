import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, XCircle } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { EstadoError, Skeleton } from '@/shared/components';
import { useCancelarPedidoMutation, usePedido } from '@/features/orders/hooks/useOrders';
import { EstadoPedido } from '@/shared/api/types';
import { formaPagoLabel } from '@/shared/api/labels';
import { handleApiError } from '@/shared/api/handleApiError';

export function PedidoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : Number.NaN;
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  const { data: pedido, isLoading, isError, error, refetch } = usePedido(
    isValidId ? numericId : 0,
  );
  const cancelarMutation = useCancelarPedidoMutation();
  const [actionError, setActionError] = useState('');

  const handleCancel = async (pedidoId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    setActionError('');
    try {
      await cancelarMutation.mutateAsync(pedidoId);
    } catch (err: unknown) {
      setActionError(handleApiError(err));
    }
  };

  if (!isValidId) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Link to="/mis-pedidos" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand">
            <ArrowLeft className="h-4 w-4" />
            Volver a mis pedidos
          </Link>
          <EstadoError message="El identificador del pedido no es válido." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <Link to="/mis-pedidos" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver a mis pedidos
        </Link>

        {actionError && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {actionError}
          </div>
        )}

        {isLoading ? (
          <Skeleton variant="detail" />
        ) : isError || !pedido ? (
          <EstadoError error={error} onRetry={() => void refetch()} />
        ) : (
          <Card
            title={`Pedido #${pedido.id}`}
            actions={<BadgeEstado estado={pedido.estado} />}
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 block">Fecha</span>
                  <span className="font-medium text-gray-900">
                    {new Date(pedido.created_at).toLocaleString('es-AR')}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Forma de pago</span>
                  <span className="font-medium text-gray-900">
                    {formaPagoLabel[pedido.forma_pago]}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-gray-500 block">Dirección de entrega</span>
                  <span className="font-medium text-gray-900">{pedido.direccion_entrega}</span>
                </div>
                {pedido.notas && (
                  <div className="sm:col-span-2">
                    <span className="text-gray-500 block">Notas</span>
                    <span className="font-medium text-gray-900">{pedido.notas}</span>
                  </div>
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Detalle de productos</h4>
                <ul className="space-y-2">
                  {pedido.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-700">
                        {item.cantidad}x {item.nombre_producto} (${item.precio_unitario.toFixed(2)} c/u)
                      </span>
                      <span className="font-medium text-gray-900">${item.subtotal.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between font-bold text-lg mt-4 pt-3 border-t">
                  <span>Total</span>
                  <span className="text-brand">${pedido.total.toFixed(2)}</span>
                </div>
              </div>

              {pedido.estado === EstadoPedido.PENDIENTE && (
                <div className="pt-2">
                  <Button
                    variant="danger"
                    className="w-full sm:w-auto"
                    loading={cancelarMutation.isPending}
                    onClick={() => void handleCancel(pedido.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar pedido
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
