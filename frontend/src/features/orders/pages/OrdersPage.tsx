import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, ExternalLink, Package, XCircle } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { EstadoError, EstadoVacio, Paginacion, Skeleton } from '../../../shared/components';
import { useCancelarPedidoMutation, usePedidos } from '../hooks/useOrders';
import { EstadoPedido } from '../../../shared/api/types';
import { estadoPedidoLabel, formaPagoLabel } from '../../../shared/api/labels';
import { handleApiError } from '../../../shared/api/handleApiError';

const LIMIT = 10;

export function OrdersPage() {
  const [page, setPage] = useState(0);
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<EstadoPedido | undefined>();
  const [actionError, setActionError] = useState('');

  const { data, isLoading, isError, error, refetch } = usePedidos(
    page * LIMIT,
    LIMIT,
    filterEstado,
  );
  const cancelarMutation = useCancelarPedidoMutation();

  const pedidoSeleccionado = data?.items.find((p) => p.id === selectedPedido);
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const handleCancel = async (pedidoId: number) => {
    if (!window.confirm('¿Estás seguro de cancelar este pedido?')) return;
    setActionError('');
    try {
      await cancelarMutation.mutateAsync(pedidoId);
    } catch (err: unknown) {
      setActionError(handleApiError(err));
    }
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-gray-500 mt-1">Consultá el estado de tus pedidos</p>
      </div>

      {actionError && (
        <div
          role="alert"
          className="mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
        >
          {actionError}
        </div>
      )}

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          type="button"
          onClick={() => {
            setFilterEstado(undefined);
            setPage(0);
          }}
          className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
            !filterEstado
              ? 'bg-brand text-white border-brand'
              : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {Object.values(EstadoPedido).map((estado) => (
          <button
            type="button"
            key={estado}
            onClick={() => {
              setFilterEstado(estado);
              setPage(0);
            }}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              filterEstado === estado
                ? 'bg-brand text-white border-brand'
                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {estadoPedidoLabel[estado]}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pedidos */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            <Skeleton variant="list" count={3} />
          ) : isError ? (
            <EstadoError error={error} onRetry={() => void refetch()} />
          ) : !data || data.items.length === 0 ? (
            <EstadoVacio
              title="No tenés pedidos aún"
              description="Cuando confirmes un pedido desde el carrito aparecerá aquí."
              action={
                <Link
                  to="/"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
                >
                  Ir al catálogo
                </Link>
              }
            />
          ) : (
            <>
              {data.items.map((pedido) => (
                <Card
                  key={pedido.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPedido === pedido.id ? 'ring-2 ring-brand' : 'hover:shadow-md'
                  }`}
                >
                  <div
                    className="flex items-center justify-between"
                    onClick={() => setSelectedPedido(pedido.id)}
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900">Pedido #{pedido.id}</h3>
                        <BadgeEstado estado={pedido.estado} />
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(pedido.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-brand">${pedido.total.toFixed(2)}</p>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  </div>
                </Card>
              ))}

              <Paginacion
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
                className="mt-4"
              />
            </>
          )}
        </div>

        {/* Detalle del pedido */}
        <div>
          {pedidoSeleccionado ? (
            <Card
              title={`Pedido #${pedidoSeleccionado.id}`}
              actions={
                <Link
                  to={`/mis-pedidos/${pedidoSeleccionado.id}`}
                  className="text-xs text-brand hover:underline inline-flex items-center gap-1"
                >
                  Ver página
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              }
            >
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-gray-500">Estado</span>
                  <div className="mt-1">
                    <BadgeEstado estado={pedidoSeleccionado.estado} />
                  </div>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Pago</span>
                  <p className="font-medium">{formaPagoLabel[pedidoSeleccionado.forma_pago]}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Dirección</span>
                  <p className="font-medium">{pedidoSeleccionado.direccion_entrega}</p>
                </div>
                {pedidoSeleccionado.notas && (
                  <div>
                    <span className="text-sm text-gray-500">Notas</span>
                    <p className="font-medium">{pedidoSeleccionado.notas}</p>
                  </div>
                )}
                <div className="border-t pt-3">
                  <span className="text-sm text-gray-500">Productos</span>
                  <ul className="mt-2 space-y-2">
                    {pedidoSeleccionado.items.map((item) => (
                      <li key={item.id} className="flex justify-between text-sm">
                        <span className="text-gray-700">
                          {item.cantidad}x {item.nombre_producto}
                        </span>
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                    <span>Total</span>
                    <span className="text-brand">${pedidoSeleccionado.total.toFixed(2)}</span>
                  </div>
                </div>

                {pedidoSeleccionado.estado === EstadoPedido.PENDIENTE && (
                  <Button
                    variant="danger"
                    className="w-full"
                    loading={cancelarMutation.isPending}
                    onClick={() => void handleCancel(pedidoSeleccionado.id)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar pedido
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <Card>
              <div className="text-center py-8 text-gray-400">
                <Package className="h-10 w-10 mx-auto mb-2" />
                <p className="text-sm">Seleccioná un pedido para ver el detalle</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
