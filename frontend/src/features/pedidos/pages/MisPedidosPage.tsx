import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Eye, XCircle } from 'lucide-react';
import { useCancelarPedido, usePedidos } from '../hooks/usePedidos';
import type { Pedido } from '../types/pedido.types';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { formatFecha, formatPrecio } from '@/shared/utils/formatters';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Paginacion } from '@/shared/components/Paginacion';
import { TablaSkeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';

const POR_PAGINA = 10;

export function MisPedidosPage() {
  const [pagina, setPagina] = useState(0);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(
    null,
  );
  const [cancelandoId, setCancelandoId] = useState<number | null>(null);

  const showNotification = useNotificationStore((s) => s.showNotification);
  const pedidosQuery = usePedidos({
    skip: pagina * POR_PAGINA,
    limit: POR_PAGINA,
  });
  const cancelarMutation = useCancelarPedido();

  const handleCancelar = async (pedido: Pedido) => {
    const confirmado = window.confirm(
      `¿Seguro que querés cancelar el pedido #${pedido.id}? Se restituirá el stock automáticamente.`,
    );
    if (!confirmado) return;

    setCancelandoId(pedido.id);
    try {
      await cancelarMutation.mutateAsync(pedido.id);
      showNotification(`Pedido #${pedido.id} cancelado correctamente.`, 'info');
    } catch (error) {
      showNotification(handleApiError(error), 'error');
    } finally {
      setCancelandoId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Mis pedidos</h1>
          <p className="text-sm text-stone-500">
            Consultá el estado de tus compras o cancelá pedidos pendientes.
          </p>
        </div>
        <Link to="/">
          <Button variant="secondary" size="sm">
            Hacer un nuevo pedido
          </Button>
        </Link>
      </div>

      {pedidosQuery.isPending ? (
        <TablaSkeleton filas={4} />
      ) : pedidosQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidosQuery.error)}
          onReintentar={() => void pedidosQuery.refetch()}
        />
      ) : pedidosQuery.data.items.length === 0 ? (
        <EstadoVacio
          titulo="Todavía no hiciste ningún pedido"
          descripcion="Cuando confirmes una compra, vas a poder seguir su estado desde esta pantalla."
          accion={
            <Link to="/">
              <Button>Explorar catálogo</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="space-y-4">
            {pedidosQuery.data.items.map((pedido) => (
              <Card
                key={pedido.id}
                className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-bold text-stone-900">
                      Pedido #{pedido.id}
                    </span>
                    <BadgeEstado estado={pedido.estado} />
                    <span className="text-xs text-stone-500">
                      {formatFecha(pedido.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-stone-600">
                    <span className="font-medium">Entrega:</span>{' '}
                    {pedido.direccion_entrega} ·{' '}
                    <span className="font-medium">Pago:</span>{' '}
                    {pedido.forma_pago === 'EFECTIVO'
                      ? 'Efectivo'
                      : 'Transferencia'}
                  </p>
                  <p className="text-xs text-stone-500">
                    {pedido.items.length}{' '}
                    {pedido.items.length === 1 ? 'ítem' : 'ítems'} · Total:{' '}
                    <span className="font-semibold text-stone-900">
                      {formatPrecio(pedido.total)}
                    </span>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPedidoSeleccionado(pedido)}
                  >
                    <Eye className="h-4 w-4" />
                    Ver detalle
                  </Button>
                  {pedido.estado === 'PENDIENTE' && (
                    <Button
                      variant="danger"
                      size="sm"
                      isLoading={cancelandoId === pedido.id}
                      onClick={() => void handleCancelar(pedido)}
                    >
                      <XCircle className="h-4 w-4" />
                      Cancelar
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>

          <Paginacion
            paginaActual={pagina}
            totalItems={pedidosQuery.data.total}
            porPagina={POR_PAGINA}
            onCambiarPagina={setPagina}
          />
        </>
      )}

      <DetallePedidoModal
        pedido={pedidoSeleccionado}
        onClose={() => setPedidoSeleccionado(null)}
      />
    </div>
  );
}
