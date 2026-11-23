import { useCallback, useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Eye, Package } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { AdminSidebar } from '../../../shared/layout/AdminSidebar';
import { Card } from '../../../shared/ui/Card';
import { BadgeEstado } from '../../../shared/ui/BadgeEstado';
import { Modal } from '../../../shared/ui/Modal';
import { Button } from '../../../shared/ui/Button';
import { EstadoError, EstadoVacio, Paginacion, Skeleton } from '../../../shared/components';
import { useAdminPedidos, useUpdateEstadoPedidoMutation } from '../hooks/useAdmin';
import { EstadoPedido, type PedidoRead } from '../../../shared/api/types';
import { estadoPedidoLabel, formaPagoLabel } from '../../../shared/api/labels';
import { handleApiError } from '../../../shared/api/handleApiError';

const LIMIT = 10;
const EMPTY_PEDIDOS: PedidoRead[] = [];

const transiciones: Record<EstadoPedido, EstadoPedido[]> = {
  [EstadoPedido.PENDIENTE]: [EstadoPedido.EN_PREPARACION, EstadoPedido.CANCELADO],
  [EstadoPedido.EN_PREPARACION]: [EstadoPedido.ENTREGADO, EstadoPedido.CANCELADO],
  [EstadoPedido.ENTREGADO]: [],
  [EstadoPedido.CANCELADO]: [],
};

const columnHelper = createColumnHelper<PedidoRead>();

export function AdminPedidosPage() {
  const [page, setPage] = useState(0);
  const [selectedPedidoId, setSelectedPedidoId] = useState<number | null>(null);
  const [filterEstado, setFilterEstado] = useState<EstadoPedido | undefined>();

  const [modalOpen, setModalOpen] = useState(false);
  const [targetPedidoId, setTargetPedidoId] = useState<number | null>(null);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoPedido | null>(null);
  const [modalError, setModalError] = useState('');

  const { data, isLoading, isError, error, refetch } = useAdminPedidos(
    page * LIMIT,
    LIMIT,
    filterEstado,
  );
  const updateEstado = useUpdateEstadoPedidoMutation();

  const pedidos = data?.items ?? EMPTY_PEDIDOS;
  const pedidoSeleccionado = pedidos.find((p) => p.id === selectedPedidoId);
  const totalPages = data ? Math.ceil(data.total / LIMIT) : 0;

  const abrirCambioEstado = useCallback((pedidoId: number, estado: EstadoPedido) => {
    setTargetPedidoId(pedidoId);
    setNuevoEstado(estado);
    setModalError('');
    setModalOpen(true);
  }, []);

  const cerrarModal = useCallback(() => {
    setModalOpen(false);
    setModalError('');
  }, []);

  const confirmarCambio = async () => {
    if (!targetPedidoId || !nuevoEstado) return;
    setModalError('');
    try {
      await updateEstado.mutateAsync({ id: targetPedidoId, estado: nuevoEstado });
      setModalOpen(false);
      setNuevoEstado(null);
      setTargetPedidoId(null);
    } catch (err: unknown) {
      setModalError(handleApiError(err));
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'Pedido',
        cell: (info) => <span className="font-semibold text-gray-900">#{info.getValue()}</span>,
      }),
      columnHelper.accessor('estado', {
        header: 'Estado',
        cell: (info) => <BadgeEstado estado={info.getValue()} />,
      }),
      columnHelper.accessor('forma_pago', {
        header: 'Pago',
        cell: (info) => formaPagoLabel[info.getValue()],
      }),
      columnHelper.accessor('total', {
        header: 'Total',
        cell: (info) => (
          <span className="font-semibold text-brand">${info.getValue().toFixed(2)}</span>
        ),
      }),
      columnHelper.accessor('created_at', {
        header: 'Fecha',
        cell: (info) =>
          new Date(info.getValue()).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit',
          }),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const pedido = row.original;
          const nextStates = transiciones[pedido.estado];
          return (
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedPedidoId(pedido.id)}
                title="Ver detalle"
              >
                <Eye className="h-4 w-4" />
              </Button>
              {nextStates.map((estado) => (
                <Button
                  key={estado}
                  variant={estado === EstadoPedido.CANCELADO ? 'danger' : 'primary'}
                  size="sm"
                  onClick={() => abrirCambioEstado(pedido.id, estado)}
                >
                  {estado === EstadoPedido.EN_PREPARACION
                    ? 'Preparar'
                    : estado === EstadoPedido.ENTREGADO
                      ? 'Entregar'
                      : 'Cancelar'}
                </Button>
              ))}
            </div>
          );
        },
      }),
    ],
    [abrirCambioEstado],
  );

  const table = useReactTable({
    data: pedidos,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de pedidos</h1>
            <p className="text-gray-500 mt-1">Administrá todos los pedidos y su máquina de estados</p>
          </div>

          {/* Filtro por estado */}
          <div className="flex flex-wrap gap-2">
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

          {isLoading ? (
            <Skeleton variant="list" count={4} />
          ) : isError ? (
            <EstadoError error={error} onRetry={() => void refetch()} />
          ) : pedidos.length === 0 ? (
            <EstadoVacio
              title="No hay pedidos"
              description="No se encontraron pedidos para el filtro seleccionado."
            />
          ) : (
            <>
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-gray-50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-4 py-3 text-left font-semibold text-gray-600"
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className={`hover:bg-gray-50 ${
                            selectedPedidoId === row.original.id ? 'bg-orange-50/40' : ''
                          }`}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 text-gray-700">
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <Paginacion page={page} totalPages={totalPages} onPageChange={setPage} />
            </>
          )}

          {/* Panel de detalle del pedido seleccionado */}
          {pedidoSeleccionado ? (
            <Card
              title={`Detalle del pedido #${pedidoSeleccionado.id}`}
              actions={<BadgeEstado estado={pedidoSeleccionado.estado} />}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-500">Dirección: </span>
                    <span className="font-medium text-gray-900">
                      {pedidoSeleccionado.direccion_entrega}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-500">Pago: </span>
                    <span className="font-medium text-gray-900">
                      {formaPagoLabel[pedidoSeleccionado.forma_pago]}
                    </span>
                  </p>
                  {pedidoSeleccionado.notas && (
                    <p>
                      <span className="text-gray-500">Notas: </span>
                      <span className="font-medium text-gray-900">{pedidoSeleccionado.notas}</span>
                    </p>
                  )}
                </div>
                <div>
                  <ul className="space-y-1.5 text-sm">
                    {pedidoSeleccionado.items.map((item) => (
                      <li key={item.id} className="flex justify-between">
                        <span>
                          {item.cantidad}x {item.nombre_producto}
                        </span>
                        <span className="font-medium">${item.subtotal.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex justify-between font-bold text-base mt-3 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-brand">${pedidoSeleccionado.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ) : (
            pedidos.length > 0 && (
              <Card>
                <div className="flex items-center gap-3 text-gray-400 text-sm">
                  <Package className="h-5 w-5" />
                  <span>Hacé clic en el ícono de ojo de una fila para ver el detalle completo del pedido.</span>
                </div>
              </Card>
            )
          )}
        </div>

        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>
      </div>

      <Modal open={modalOpen} onClose={cerrarModal} title="Confirmar cambio de estado">
        {modalError && (
          <div
            role="alert"
            className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2"
          >
            {modalError}
          </div>
        )}
        <p className="text-gray-700 mb-4">
          ¿Estás seguro de cambiar el estado a{' '}
          <strong>{nuevoEstado ? estadoPedidoLabel[nuevoEstado] : ''}</strong> del pedido #
          {targetPedidoId}?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={cerrarModal}>
            Cancelar
          </Button>
          <Button
            variant={nuevoEstado === EstadoPedido.CANCELADO ? 'danger' : 'primary'}
            loading={updateEstado.isPending}
            onClick={() => void confirmarCambio()}
          >
            Confirmar
          </Button>
        </div>
      </Modal>
    </MainLayout>
  );
}
