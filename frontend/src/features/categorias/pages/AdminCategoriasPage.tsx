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
import { Pencil, Plus, Trash2 } from 'lucide-react';
import {
  useActualizarCategoria,
  useCategorias,
  useCrearCategoria,
  useEliminarCategoria,
} from '../hooks/useCategorias';
import type { Categoria, CategoriaCreate } from '../types/categoria.types';
import { CategoriaFormModal } from '../components/CategoriaFormModal';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { TablaSkeleton } from '@/shared/components/Skeleton';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

const columnHelper = createColumnHelper<Categoria>();
const categoriasVacias: Categoria[] = [];

export function AdminCategoriasPage() {
  const categoriasQuery = useCategorias();
  const crearMutation = useCrearCategoria();
  const actualizarMutation = useActualizarCategoria();
  const eliminarMutation = useEliminarCategoria();
  const showNotification = useNotificationStore((s) => s.showNotification);

  const [modalAbierto, setModalAbierto] = useState(false);
  const [categoriaEditar, setCategoriaEditar] = useState<Categoria | null>(
    null,
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const abrirCrear = () => {
    setCategoriaEditar(null);
    setFormError(null);
    setModalAbierto(true);
  };

  const abrirEditar = (categoria: Categoria) => {
    setCategoriaEditar(categoria);
    setFormError(null);
    setModalAbierto(true);
  };

  const handleGuardar = async (values: CategoriaCreate) => {
    setFormError(null);
    try {
      if (categoriaEditar) {
        await actualizarMutation.mutateAsync({
          id: categoriaEditar.id,
          payload: values,
        });
        showNotification('Categoría actualizada correctamente.', 'success');
      } else {
        await crearMutation.mutateAsync(values);
        showNotification('Categoría creada correctamente.', 'success');
      }
      setModalAbierto(false);
    } catch (error) {
      setFormError(handleApiError(error));
    }
  };

  const handleEliminar = async (categoria: Categoria) => {
    const ok = window.confirm(
      `¿Dar de baja la categoría "${categoria.nombre}"? Esta acción aplica baja lógica.`,
    );
    if (!ok) return;
    try {
      await eliminarMutation.mutateAsync(categoria.id);
      showNotification(`Categoría "${categoria.nombre}" dada de baja.`, 'info');
    } catch (error) {
      showNotification(handleApiError(error), 'error');
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('id', {
        header: 'ID',
        cell: (info) => (
          <span className="font-mono text-xs text-stone-500">
            #{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => (
          <span className="font-semibold text-stone-900">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => (
          <span className="text-stone-600">{info.getValue() || '—'}</span>
        ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const cat = info.row.original;
          return (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => abrirEditar(cat)}
              >
                <Pencil className="h-3.5 w-3.5" />
                Editar
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => void handleEliminar(cat)}
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
    data: categoriasQuery.data ?? categoriasVacias,
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
            Gestión de categorías
          </h1>
          <p className="text-sm text-stone-500">
            Creá, editá o dá de baja las categorías del catálogo.
          </p>
        </div>
        <Button onClick={abrirCrear}>
          <Plus className="h-4 w-4" />
          Nueva categoría
        </Button>
      </div>

      {categoriasQuery.isPending ? (
        <TablaSkeleton />
      ) : categoriasQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(categoriasQuery.error)}
          onReintentar={() => void categoriasQuery.refetch()}
        />
      ) : categoriasQuery.data.length === 0 ? (
        <EstadoVacio
          titulo="No hay categorías activas"
          descripcion="Creá tu primera categoría para organizar los productos."
          accion={<Button onClick={abrirCrear}>Crear categoría</Button>}
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
              {Math.max(1, table.getPageCount())}
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

      {modalAbierto && (
        <CategoriaFormModal
          key={categoriaEditar ? `edit-${categoriaEditar.id}` : 'create'}
          open={modalAbierto}
          categoriaEditar={categoriaEditar}
          onClose={() => setModalAbierto(false)}
          onSubmit={handleGuardar}
          serverError={formError}
        />
      )}
    </div>
  );
}
