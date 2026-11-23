import { useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type PaginationState,
  type SortingState,
} from '@tanstack/react-table';
import { Check, ChefHat, Eye, XCircle } from 'lucide-react';
import { useCambiarEstadoPedido, usePedidos } from '../hooks/usePedidos';
import type { EstadoPedido, Pedido } from '../types/pedido.types';
import { DetallePedidoModal } from '../components/DetallePedidoModal';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { formatFecha, formatPrecio } from '@/shared/utils/formatters';
import { BadgeEstado } from '@/shared/ui/BadgeEstado';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { TablaSkeleton } from '@/shared/components/Skeleton';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

const columnHelper = createColumnHelper<Pedido>();
const pedidosVacios: Pedido[] = [];

const filtrosEstado: Array<{ valor: EstadoPedido | 'TODOS'; label: string }> = [
  { valor: 'TODOS', label: 'Todos' },
  { valor: 'PENDIENTE', label: 'Pendientes' },
  { valor: 'EN_PREPARACION', label: 'En preparación' },
  { valor: 'ENTREGADO', label: 'Entregados' },
  { valor: 'CANCELADO', label: 'Cancelados' },
];

export function AdminPedidosPage() {
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoPedido | 'TODOS'>(
    'TODOS',
  );
  const [pedidoDetalle, setPedidoDetalle] = useState<Pedido | null>(null);
  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const showNotification = useNotificationStore((s) => s.showNotification);
  const pedidosQuery = usePedidos({
    skip: 0,
    limit: 100,
    estado: estadoFiltro === 'TODOS' ? undefined : estadoFiltro,
  });
  const cambiarEstadoMutation = useCambiarEstadoPedido();

  const handleCambiarEstado = async (pedido: Pedido, nuevoEstado: EstadoPedido) => {
    if (nuevoEstado === 'CANCELADO') {
      const ok = window.confirm(
        `¿Cancelar el pedido #${pedido.id}? Se restituirá el stock de todos sus productos.`,
      );
      if (!ok) return;
    }
    setProcesandoId(pedido.id);
    try {
      await cambiarEstadoMutation.mutateAsync({
        id: pedido.id,
        estado: nuevoEstado,
      });
      showNotification(
        `Pedido #${pedido.id} actualizado a ${nuevoEstado}.`,
        'success',
      );
    } catch (error) {
      showNotification(handleApiError(error), 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Pedido',
        cell: (info) => (
          <span className="font-mono font-semibold text-stone-900">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) => (
          <span className="whitespace-nowrap text-xs text-stone-600">
            {formatFecha(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('direccion_entrega', {
        header: 'Entrega / Pago',
        cell: (info) => (
          <div className="max-w-xs">
            <p className="truncate font-medium text-stone-900">
              {info.getValue()}
            </p>
            <p className="text-xs text-stone-500">
              Usuario #{info.row.original.usuario_id} ·{' '}
              {info.row.original.forma_pago === 'EFECTIVO'
                ? 'Efectivo'
                : 'Transferencia'}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-semibold text-stone-900">
            {formatPrecio(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const pedido = info.row.original;
          const ocupado = procesandoId === pedido.id;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPedidoDetalle(pedido)}
              >
                <Eye className="h-3.5 w-3.5" />
                Detalle
              </Button>
              {pedido.estado === 'PENDIENTE' && (
                <>
                  <Button
                    variant="primary"
                    size="sm"
                    isLoading={ocupado}
                    onClick={() =>
                      void handleCambiarEstado(pedido, 'EN_PREPARACION')
                    }
                  >
                    <ChefHat className="h-3.5 w-3.5" />
                    Preparar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={ocupado}
                    onClick={() => void handleCambiarEstado(pedido, 'CANCELADO')}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </>
              )}
              {pedido.estado === 'EN_PREPARACION' && (
                <>
                  <Button
                    variant="success"
                    size="sm"
                    isLoading={ocupado}
                    onClick={() => void handleCambiarEstado(pedido, 'ENTREGADO')}
                  >
                    <Check className="h-3.5 w-3.5" />
                    Entregar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    isLoading={ocupado}
                    onClick={() => void handleCambiarEstado(pedido, 'CANCELADO')}
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar
                  </Button>
                </>
              )}
            </div>
          );
        },
      }),
    ],
    [procesandoId],
  );

  const table = useReactTable({
    data: pedidosQuery.data?.items ?? pedidosVacios,
    columns,
    state: { sorting, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          Gestión de pedidos
        </h1>
        <p className="text-sm text-stone-500">
          Avanzá los pedidos según la máquina de estados o cancelá con
          restitución automática de stock.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {filtrosEstado.map((filtro) => (
          <button
            key={filtro.valor}
            type="button"
            onClick={() => {
              setEstadoFiltro(filtro.valor);
              setPagination((prev) => ({ ...prev, pageIndex: 0 }));
            }}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              estadoFiltro === filtro.valor
                ? 'bg-orange-600 text-white'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>

      {pedidosQuery.isPending ? (
        <TablaSkeleton />
      ) : pedidosQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(pedidosQuery.error)}
          onReintentar={() => void pedidosQuery.refetch()}
        />
      ) : pedidosQuery.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No hay pedidos para mostrar"
          descripcion={
            estadoFiltro === 'TODOS'
              ? 'Todavía no se registró ningún pedido en el sistema.'
              : 'No hay pedidos con el estado seleccionado.'
          }
        />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase text-stone-600">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th key={header.id} className="px-4 py-3 font-semibold">
                        {header.isPlaceholder ? null : (
                          <button
                            type="button"
                            onClick={header.column.getToggleSortingHandler()}
                            disabled={!header.column.getCanSort()}
                            className="inline-flex items-center gap-1 disabled:cursor-default cursor-pointer"
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                            {{ asc: ' ▲', desc: ' ▼' }[
                              header.column.getIsSorted() as string
                            ] ?? null}
                          </button>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y divide-stone-100">
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="hover:bg-stone-50/70">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-3">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200 px-4 py-3 text-sm">
            <span className="text-stone-600">
              Página {table.getState().pagination.pageIndex + 1} de{' '}
              {Math.max(1, table.getPageCount())} ({pedidosQuery.data.total}{' '}
              pedidos)
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Anterior
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </Card>
      )}

      <DetallePedidoModal
        pedido={pedidoDetalle}
        onClose={() => setPedidoDetalle(null)}
      />
    </div>
  );
}
