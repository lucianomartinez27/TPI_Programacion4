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
import { Boxes, Edit2, Plus, Trash2 } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { AdminSidebar } from '@/shared/layout/AdminSidebar';
import { Button } from '@/shared/ui/Button';
import { Input } from '@/shared/ui/Input';
import { Modal } from '@/shared/ui/Modal';
import { EstadoError, EstadoVacio, Skeleton } from '@/shared/components';
import { useProductos } from '@/features/catalog';
import {
  useAllCategorias,
  useCreateProductoMutation,
  useDeleteProductoMutation,
  useUpdateProductoMutation,
  useUpdateStockMutation,
} from '@/features/admin/hooks/useAdmin';
import type { ProductoRead } from '@/shared/api/types';
import { handleApiError } from '@/shared/api/handleApiError';

interface ProductFormValues {
  categoria_id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string;
  stock: number;
  disponible: boolean;
}

interface StockFormValues {
  stock: number;
  disponible: boolean;
}

const EMPTY_PRODUCTOS: ProductoRead[] = [];

const defaultProductValues: ProductFormValues = {
  categoria_id: 0,
  nombre: '',
  descripcion: '',
  precio_base: 0,
  imagen_url: '',
  stock: 0,
  disponible: true,
};

const defaultStockValues: StockFormValues = {
  stock: 0,
  disponible: true,
};

const columnHelper = createColumnHelper<ProductoRead>();

function validateOptionalUrl(value: string): string | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return 'La URL debe comenzar con http:// o https://';
    }
    return undefined;
  } catch {
    return 'Ingresá una URL válida';
  }
}

export function AdminProductosPage() {
  const { data: productos, isLoading, isError, error: queryError, refetch } = useProductos(0, 100);
  const { data: categorias } = useAllCategorias();
  const createMutation = useCreateProductoMutation();
  const updateMutation = useUpdateProductoMutation();
  const updateStockMutation = useUpdateStockMutation();
  const deleteMutation = useDeleteProductoMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [formError, setFormError] = useState('');
  const [actionError, setActionError] = useState('');

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState<number | null>(null);
  const [stockProductName, setStockProductName] = useState('');
  const [stockError, setStockError] = useState('');

  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const form = useForm({
    defaultValues: defaultProductValues,
    onSubmit: async ({ value }) => {
      setFormError('');
      try {
        const payload = {
          categoria_id: value.categoria_id,
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || undefined,
          precio_base: value.precio_base,
          imagen_url: value.imagen_url.trim() || undefined,
          stock: value.stock,
          disponible: value.disponible,
        };
        if (editId) {
          await updateMutation.mutateAsync({ id: editId, data: payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
        form.reset();
        setModalOpen(false);
      } catch (err: unknown) {
        setFormError(handleApiError(err));
      }
    },
  });

  const stockForm = useForm({
    defaultValues: defaultStockValues,
    onSubmit: async ({ value }) => {
      if (stockProductId === null) return;
      setStockError('');
      try {
        await updateStockMutation.mutateAsync({
          id: stockProductId,
          stock: value.stock,
          disponible: value.disponible,
        });
        stockForm.reset();
        setStockModalOpen(false);
      } catch (err: unknown) {
        setStockError(handleApiError(err));
      }
    },
  });

  const cerrarModal = useCallback(() => setModalOpen(false), []);
  const cerrarStockModal = useCallback(() => setStockModalOpen(false), []);

  const abrirCrear = useCallback(() => {
    setEditId(null);
    form.reset();
    form.setFieldValue('categoria_id', 0);
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    form.setFieldValue('precio_base', 0);
    form.setFieldValue('imagen_url', '');
    form.setFieldValue('stock', 0);
    form.setFieldValue('disponible', true);
    setFormError('');
    setModalOpen(true);
  }, [form]);

  const abrirEditar = useCallback(
    (p: ProductoRead) => {
      setEditId(p.id);
      form.reset();
      form.setFieldValue('categoria_id', p.categoria_id);
      form.setFieldValue('nombre', p.nombre);
      form.setFieldValue('descripcion', p.descripcion ?? '');
      form.setFieldValue('precio_base', p.precio_base);
      form.setFieldValue('imagen_url', p.imagen_url ?? '');
      form.setFieldValue('stock', p.stock);
      form.setFieldValue('disponible', p.disponible);
      setFormError('');
      setModalOpen(true);
    },
    [form],
  );

  const abrirStock = useCallback(
    (p: ProductoRead) => {
      setStockProductId(p.id);
      setStockProductName(p.nombre);
      stockForm.reset();
      stockForm.setFieldValue('stock', p.stock);
      stockForm.setFieldValue('disponible', p.disponible);
      setStockError('');
      setStockModalOpen(true);
    },
    [stockForm],
  );

  const handleDelete = useCallback(
    async (id: number) => {
      if (!window.confirm('¿Estás seguro de desactivar este producto?')) return;
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
        header: 'Producto',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue()}</span>,
      }),
      columnHelper.accessor((row) => row.categoria?.nombre ?? '—', {
        id: 'categoria',
        header: 'Categoría',
      }),
      columnHelper.accessor('precio_base', {
        header: 'Precio',
        cell: (info) => (
          <span className="font-medium text-brand">${info.getValue().toFixed(2)}</span>
        ),
      }),
      columnHelper.accessor('stock', {
        header: 'Stock',
      }),
      columnHelper.accessor('disponible', {
        header: 'Estado',
        cell: (info) => {
          const disponible = info.getValue();
          return (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                disponible ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {disponible ? 'Disponible' : 'No disponible'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const p = row.original;
          return (
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" onClick={() => abrirStock(p)} title="Stock y disponibilidad">
                <Boxes className="h-4 w-4 text-blue-600" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => abrirEditar(p)} title="Editar">
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={deleteMutation.isPending}
                onClick={() => void handleDelete(p.id)}
                title="Desactivar"
              >
                <Trash2 className="h-4 w-4 text-error" />
              </Button>
            </div>
          );
        },
      }),
    ],
    [abrirEditar, abrirStock, handleDelete, deleteMutation.isPending],
  );

  const items = productos?.items ?? EMPTY_PRODUCTOS;

  const table = useReactTable({
    data: items,
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
              <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
              <p className="text-gray-500 mt-1">Gestioná los productos del catálogo</p>
            </div>
            <Button onClick={abrirCrear}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo producto
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
            <Skeleton variant="list" count={4} />
          ) : isError ? (
            <EstadoError error={queryError} onRetry={() => void refetch()} />
          ) : items.length === 0 ? (
            <EstadoVacio
              title="No hay productos cargados"
              description="Agregá tu primer producto para publicarlo en el catálogo."
              action={<Button onClick={abrirCrear}>Nuevo producto</Button>}
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

      {/* Modal crear/editar producto */}
      <Modal
        open={modalOpen}
        onClose={cerrarModal}
        title={editId ? 'Editar producto' : 'Nuevo producto'}
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
            name="categoria_id"
            validators={{
              onChange: ({ value }) => (!value || value <= 0 ? 'Seleccioná una categoría' : undefined),
              onBlur: ({ value }) => (!value || value <= 0 ? 'Seleccioná una categoría' : undefined),
            }}
          >
            {(field) => {
              const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
              return (
                <div>
                  <label
                    htmlFor="producto-categoria"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Categoría
                  </label>
                  <select
                    id="producto-categoria"
                    name={field.name}
                    value={field.state.value || ''}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(Number(e.target.value) || 0)}
                    className={`w-full px-3 py-2 border rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-brand bg-white ${
                      fieldError ? 'border-error' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Seleccionar...</option>
                    {categorias
                      ?.filter((c) => c.activo)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.nombre}
                        </option>
                      ))}
                  </select>
                  {fieldError && <p className="text-xs text-error mt-1">{fieldError}</p>}
                </div>
              );
            }}
          </form.Field>

          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
              onBlur: ({ value }) =>
                value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
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
                  htmlFor="producto-descripcion"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Descripción
                </label>
                <textarea
                  id="producto-descripcion"
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-brand"
                  rows={2}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0 ? 'El precio debe ser mayor o igual a 0' : undefined,
              onBlur: ({ value }) =>
                Number.isNaN(value) || value < 0 ? 'El precio debe ser mayor o igual a 0' : undefined,
            }}
          >
            {(field) => {
              const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
              return (
                <Input
                  label="Precio base"
                  name={field.name}
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={fieldError || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="imagen_url"
            validators={{
              onChange: ({ value }) => validateOptionalUrl(value),
              onBlur: ({ value }) => validateOptionalUrl(value),
            }}
          >
            {(field) => {
              const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
              return (
                <Input
                  label="URL de imagen"
                  name={field.name}
                  type="url"
                  placeholder="https://..."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  error={fieldError || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0 ? 'El stock debe ser mayor o igual a 0' : undefined,
              onBlur: ({ value }) =>
                Number.isNaN(value) || value < 0 ? 'El stock debe ser mayor o igual a 0' : undefined,
            }}
          >
            {(field) => {
              const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
              return (
                <Input
                  label="Stock"
                  name={field.name}
                  type="number"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={fieldError || undefined}
                />
              );
            }}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="text-brand focus-visible:outline-brand"
                />
                <span className="text-sm">Disponible</span>
              </label>
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

      {/* Modal stock y disponibilidad (con TanStack Form) */}
      <Modal
        open={stockModalOpen}
        onClose={cerrarStockModal}
        title={`Stock: ${stockProductName}`}
      >
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void stockForm.handleSubmit();
          }}
          className="space-y-4"
        >
          {stockError && (
            <div
              role="alert"
              className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2"
            >
              {stockError}
            </div>
          )}

          <stockForm.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                Number.isNaN(value) || value < 0 ? 'El stock debe ser mayor o igual a 0' : undefined,
              onBlur: ({ value }) =>
                Number.isNaN(value) || value < 0 ? 'El stock debe ser mayor o igual a 0' : undefined,
            }}
          >
            {(field) => {
              const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
              return (
                <Input
                  label="Stock"
                  name={field.name}
                  type="number"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(Number(e.target.value))}
                  error={fieldError || undefined}
                />
              );
            }}
          </stockForm.Field>

          <stockForm.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name={field.name}
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="text-brand focus-visible:outline-brand"
                />
                <span className="text-sm">Disponible para la venta</span>
              </label>
            )}
          </stockForm.Field>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={cerrarStockModal}>
              Cancelar
            </Button>
            <stockForm.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  disabled={!canSubmit}
                  loading={isSubmitting || updateStockMutation.isPending}
                >
                  Actualizar stock
                </Button>
              )}
            </stockForm.Subscribe>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
