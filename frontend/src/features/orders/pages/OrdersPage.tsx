import { useState } from 'react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { usePedidos, useCancelarPedidoMutation } from '../hooks/useOrders';
import { EstadoPedido, FormaPago } from '../../../shared/api/types';
import { Package, XCircle, ChevronRight, ChevronLeft } from 'lucide-react';

const LIMIT = 10;

export function OrdersPage() {
  const [page, setPage] = useState(0);
  const [selectedPedido, setSelectedPedido] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<EstadoPedido | undefined>();

  const { data, isLoading } = usePedidos(page * LIMIT, LIMIT, filterEstado);
  const cancelarMutation = useCancelarPedidoMutation();

  const pedidoSeleccionado = data?.items.find((p) => p.id === selectedPedido);

  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const formaPagoLabel: Record<FormaPago, string> = {
    [FormaPago.EFECTIVO]: 'Efectivo',
    [FormaPago.TRANSFERENCIA]: 'Transferencia',
  };

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-gray-500 mt-1">Consultá el estado de tus pedidos</p>
      </div>

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => { setFilterEstado(undefined); setPage(0); }}
          className={`px-3 py-1.5 text-sm rounded-full border ${
            !filterEstado ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {Object.values(EstadoPedido).map((estado) => (
          <button
            key={estado}
            onClick={() => { setFilterEstado(estado); setPage(0); }}
            className={`px-3 py-1.5 text-sm rounded-full border ${
              filterEstado === estado ? 'bg-orange-600 text-white border-orange-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {(() => {
              switch (estado) {
                case EstadoPedido.PENDIENTE: return 'Pendiente';
                case EstadoPedido.EN_PREPARACION: return 'En preparación';
                case EstadoPedido.ENTREGADO: return 'Entregado';
                case EstadoPedido.CANCELADO: return 'Cancelado';
              }
            })()}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de pedidos */}
        <div className="lg:col-span-2 space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 bg-gray-200 rounded w-32" />
                  <div className="h-6 bg-gray-200 rounded w-20" />
                </div>
                <div className="h-4 bg-gray-200 rounded w-48 mt-3" />
              </div>
            ))
          ) : data?.items.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No tenés pedidos aún</p>
            </div>
          ) : (
            <>
              {data?.items.map((pedido) => (
                <Card
                  key={pedido.id}
                  className={`cursor-pointer transition-colors ${
                    selectedPedido === pedido.id ? 'ring-2 ring-orange-500' : 'hover:shadow-md'
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
                      <p className="font-bold text-orange-600">${pedido.total.toFixed(2)}</p>
                      <ChevronRight className="h-4 w-4 text-gray-400 ml-auto" />
                    </div>
                  </div>
                </Card>
              ))}

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-600">
                    {page + 1} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                    className="px-3 py-2 text-sm border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Detalle del pedido */}
        <div>
          {pedidoSeleccionado ? (
            <Card title={`Pedido #${pedidoSeleccionado.id}`}>
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
                    <span className="text-orange-600">${pedidoSeleccionado.total.toFixed(2)}</span>
                  </div>
                </div>

                {pedidoSeleccionado.estado === EstadoPedido.PENDIENTE && (
                  <Button
                    variant="danger"
                    className="w-full"
                    loading={cancelarMutation.isPending}
                    onClick={() => {
                      if (window.confirm('¿Estás seguro de cancelar este pedido?')) {
                        cancelarMutation.mutate(pedidoSeleccionado.id);
                      }
                    }}
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
