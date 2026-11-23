import { useCallback, useMemo, useState } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { Edit2, Plus, Trash2 } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { AdminSidebar } from '../../../shared/layout/AdminSidebar';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { EstadoError, EstadoVacio, Skeleton } from '../../../shared/components';
import {
  useAllCategorias,
  useCreateCategoriaMutation,
  useDeleteCategoriaMutation,
  useUpdateCategoriaMutation,
} from '../hooks/useAdmin';
import type { CategoriaRead } from '../../../shared/api/types';
import { handleApiError } from '../../../shared/api/handleApiError';

interface CategoriaFormValues {
  nombre: string;
  descripcion: string;
}

const EMPTY_CATEGORIAS: CategoriaRead[] = [];
const defaultValues: CategoriaFormValues = { nombre: '', descripcion: '' };
const columnHelper = createColumnHelper<CategoriaRead>();

function validateNombre(value: string): string | undefined {
  const len = value.trim().length;
  if (len < 2) return 'Mínimo 2 caracteres';
  if (len > 100) return 'Máximo 100 caracteres';
  return undefined;
}

export function AdminCategoriasPage() {
  const { data, isLoading, isError, error: queryError, refetch } = useAllCategorias();
  const createMutation = useCreateCategoriaMutation();
  const updateMutation = useUpdateCategoriaMutation();
  const deleteMutation = useDeleteCategoriaMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const categorias = data ?? EMPTY_CATEGORIAS;

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setFormError('');
      try {
        if (editId) {
          await updateMutation.mutateAsync({
            id: editId,
            data: {
              nombre: value.nombre.trim(),
              descripcion: value.descripcion.trim() || undefined,
            },
          });
        } else {
          await createMutation.mutateAsync({
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim() || undefined,
          });
        }
        form.reset();
        setModalOpen(false);
      } catch (err: unknown) {
        setFormError(handleApiError(err));
      }
    },
  });

  const cerrarModal = useCallback(() => setModalOpen(false), []);

  const abrirCrear = useCallback(() => {
    setEditId(null);
    form.reset();
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    setFormError('');
    setModalOpen(true);
  }, [form]);

  const abrirEditar = useCallback(
    (cat: CategoriaRead) => {
      setEditId(cat.id);
      form.reset();
      form.setFieldValue('nombre', cat.nombre);
      form.setFieldValue('descripcion', cat.descripcion ?? '');
      setFormError('');
      setModalOpen(true);
    },
    [form],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('¿Estás seguro de desactivar esta categoría?')) return;
      setActionError('');
      try {
        await deleteMutation.mutateAsync(id);
      } catch (err: unknown) {
        setActionError(handleApiError(err));
      }
    },
    [deleteMutation],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('nombre', {
        header: 'Nombre',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor('descripcion', {
        header: 'Descripción',
        cell: (info) => info.getValue() ?? '—',
      }),
      columnHelper.accessor('activo', {
        header: 'Estado',
        cell: (info) => {
          const activo = info.getValue();
          return (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}
            >
              {activo ? 'Activa' : 'Inactiva'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => abrirEditar(cat)} title="Editar">
                <Edit2 className="h-4 w-4" />
              </Button>
              {cat.activo && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={deleteMutation.isPending}
                  onClick={() => void handleDelete(cat.id)}
                  title="Desactivar"
                >
                  <Trash2 className="h-4 w-4 text-error" />
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [abrirEditar, handleDelete, deleteMutation.isPending],
  );

  const table = useReactTable({
    data: categorias,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
              <p className="text-gray-500 mt-1">Gestioná las categorías de productos</p>
            </div>
            <Button onClick={abrirCrear}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva categoría
            </Button>
          </div>

          {actionError && (
            <div
              role="alert"
              className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
            >
              {actionError}
            </div>
          )}

          {isLoading ? (
            <Skeleton variant="list" count={3} />
          ) : isError ? (
            <EstadoError error={queryError} onRetry={() => void refetch()} />
          ) : categorias.length === 0 ? (
            <EstadoVacio
              title="No hay categorías cargadas"
              description="Creá tu primera categoría para empezar a organizar el catálogo."
              action={<Button onClick={abrirCrear}>Nueva categoría</Button>}
            />
          ) : (
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
                      <tr key={row.id} className="hover:bg-gray-50">
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

              {table.getPageCount() > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                  >
                    Anterior
                  </Button>
                  <span className="text-xs text-gray-500">
                    Página {table.getState().pagination.pageIndex + 1} de {table.getPageCount()}
                  </span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="lg:col-span-1">
          <AdminSidebar />
        </div>
      </div>

      {/* Modal crear/editar */}
      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title={editId ? 'Editar categoría' : 'Nueva categoría'}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {formError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2"
            >
              {formError}
            </div>
          )}

          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) => validateNombre(value),
              onBlur: ({ value }) => validateNombre(value),
            }}
          >
            {(field) => {
              const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
              return (
                <Input
                  label="Nombre"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label
                  htmlFor="categoria-descripcion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="categoria-descripcion"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-brand"
                  rows={3}
                />
              </div>
            )}
          </form.Field>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={cerrarModal}>
              Cancelar
            </Button>
            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  loading={isSubmitting || createMutation.isPending || updateMutation.isPending}
                >
                  Guardar
                </Button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
