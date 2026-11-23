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
import { Boxes, Pencil, Plus, Trash2 } from 'lucide-react';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import {
  useActualizarProducto,
  useActualizarStock,
  useCrearProducto,
  useEliminarProducto,
  useProductos,
} from '../hooks/useProductos';
import type {
  Producto,
  ProductoCreate,
  ProductoStockUpdate,
} from '../types/producto.types';
import { ProductoFormModal } from '../components/ProductoFormModal';
import { StockModal } from '../components/StockModal';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { formatPrecio } from '@/shared/utils/formatters';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { TablaSkeleton } from '@/shared/components/Skeleton';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

const columnHelper = createColumnHelper<Producto>();
const productosVacios: Producto[] = [];

export function AdminProductosPage() {
  const productosQuery = useProductos({ skip: 0, limit: 100 });
  const categoriasQuery = useCategorias();
  const crearMutation = useCrearProducto();
  const actualizarMutation = useActualizarProducto();
  const stockMutation = useActualizarStock();
  const eliminarMutation = useEliminarProducto();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [modalFormAbierto, setModalFormAbierto] = useState(false);
  const [productoEditar, setProductoEditar] = useState<Producto | null>(null);
  const [productoStock, setProductoStock] = useState<Producto | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [stockError, setStockError] = useState<string | null>(null);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const abrirCrear = () => {
    setProductoEditar(null);
    setFormError(null);
    setModalFormAbierto(true);
  };

  const abrirEditar = (prod: Producto) => {
    setProductoEditar(prod);
    setFormError(null);
    setModalFormAbierto(true);
  };

  const abrirStock = (prod: Producto) => {
    setProductoStock(prod);
    setStockError(null);
  };

  const handleGuardarProducto = async (values: ProductoCreate) => {
    setFormError(null);
    try {
      if (productoEditar) {
        await actualizarMutation.mutateAsync({
          id: productoEditar.id,
          payload: values,
        });
        showNotification('Producto actualizado correctamente.', 'success');
      } else {
        await crearMutation.mutateAsync(values);
        showNotification('Producto creado correctamente.', 'success');
      }
      setModalFormAbierto(false);
    } catch (error) {
      setFormError(handleApiError(error));
    }
  };

  const handleGuardarStock = async (id: number, values: ProductoStockUpdate) => {
    setStockError(null);
    try {
      await stockMutation.mutateAsync({ id, payload: values });
      showNotification('Stock y disponibilidad actualizados.', 'success');
      setProductoStock(null);
    } catch (error) {
      setStockError(handleApiError(error));
    }
  };

  const handleEliminar = async (prod: Producto) => {
    const ok = window.confirm(
      `¿Dar de baja el producto "${prod.nombre}"? Esta acción aplica baja lógica.`,
    );
    if (!ok) return;
    try {
      await eliminarMutation.mutateAsync(prod.id);
      showNotification(`Producto "${prod.nombre}" dado de baja.`, 'info');
    } catch (error) {
      showNotification(handleApiError(error), 'error');
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Producto',
        cell: (info) => (
          <div>
            <p className="font-semibold text-stone-900">{info.getValue()}</p>
            <p className="text-xs text-stone-500">
              {info.row.original.categoria.nombre}
            </p>
          </div>
        ),
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => (
          <span className="font-medium text-stone-900">
            {formatPrecio(info.getValue())}
          </span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
        cell: (info) => {
          const val = info.getValue();
          return (
            <span
              className={`font-semibold ${
                val === 0
                  ? 'text-red-600'
                  : val <= 5
                    ? 'text-amber-600'
                    : 'text-stone-800'
              }`}
            >
              {val} u.
            </span>
          );
        },
      }),
      columnHelper.accessor('disponible', {
        header: 'Disponible',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Disponible
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-stone-200 px-2.5 py-0.5 text-xs font-semibold text-stone-700">
              Pausado
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const prod = info.row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => abrirStock(prod)}
              >
                <Boxes className="h-3.5 w-3.5" />
                Stock
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => abrirEditar(prod)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleEliminar(prod)}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </Button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const table = useReactTable({
    data: productosQuery.data?.items ?? productosVacios,
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">
            Gestión de productos
          </h1>
          <p className="text-sm text-stone-500">
            Administrá el catálogo, los precios, el stock y la disponibilidad.
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Nuevo producto
        </Button>
      </div>

      {productosQuery.isPending ? (
        <TablaSkeleton />
      ) : productosQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(productosQuery.error)}
          onReintentar={() => void productosQuery.refetch()}
        />
      ) : productosQuery.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No hay productos activos"
          descripcion="Creá tu primer producto para empezar a vender."
          accion={<Button onClick={abrirCrear}>Crear producto</Button>}
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
              {Math.max(1, table.getPageCount())} ({productosQuery.data.total}{' '}
              productos)
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

      {modalFormAbierto && (
        <ProductoFormModal
          key={productoEditar ? `edit-prod-${productoEditar.id}` : 'create-prod'}
          open={modalFormAbierto}
          productoEditar={productoEditar}
          categorias={categoriasQuery.data ?? []}
          onClose={() => setModalFormAbierto(false)}
          onSubmit={handleGuardarProducto}
          serverError={formError}
        />
      )}

      {productoStock && (
        <StockModal
          key={`stock-${productoStock.id}`}
          producto={productoStock}
          onClose={() => setProductoStock(null)}
          onSubmit={handleGuardarStock}
          serverError={stockError}
        />
      )}
    </div>
  );
}
