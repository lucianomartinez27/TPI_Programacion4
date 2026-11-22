import { useState, useMemo } from 'react';
import { useForm } from '@tanstack/react-form';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { AdminSidebar } from '../../../shared/layout/AdminSidebar';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { Modal } from '../../../shared/ui/Modal';
import { useProductos } from '../../catalog/hooks/useCatalog';
import {
  useAllCategorias,
  useCreateProductoMutation,
  useUpdateProductoMutation,
  useUpdateStockMutation,
  useDeleteProductoMutation,
} from '../hooks/useAdmin';
import type { ProductoRead } from '../../../shared/api/types';
import { Plus, Trash2, Edit2, Boxes } from 'lucide-react';

export function AdminProductosPage() {
  const { data: productos, isLoading } = useProductos(0, 100);
  const { data: categorias } = useAllCategorias();
  const createMutation = useCreateProductoMutation();
  const updateMutation = useUpdateProductoMutation();
  const updateStockMutation = useUpdateStockMutation();
  const deleteMutation = useDeleteProductoMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [stockProductId, setStockProductId] = useState<number | null>(null);
  const [stockProductName, setStockProductName] = useState('');
  const [stockValue, setStockValue] = useState('0');
  const [stockDisponible, setStockDisponible] = useState(true);
  const [stockError, setStockError] = useState('');

  const form = useForm({
    defaultValues: {
      categoria_id: '',
      nombre: '',
      descripcion: '',
      precio_base: '',
      imagen_url: '',
      stock: '0',
      disponible: true,
    },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        const payload = {
          categoria_id: Number(value.categoria_id),
          nombre: value.nombre.trim(),
          descripcion: value.descripcion.trim() || undefined,
          precio_base: Number(value.precio_base),
          imagen_url: value.imagen_url.trim() || undefined,
          stock: Number(value.stock),
          disponible: value.disponible,
        };
        if (editId) {
          await updateMutation.mutateAsync({ id: editId, data: payload });
        } else {
          await createMutation.mutateAsync(payload);
        }
        setModalOpen(false);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Error al guardar');
      }
    },
  });

  const abrirCrear = () => {
    setEditId(null);
    form.reset();
    form.setFieldValue('categoria_id', '');
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    form.setFieldValue('precio_base', '');
    form.setFieldValue('imagen_url', '');
    form.setFieldValue('stock', '0');
    form.setFieldValue('disponible', true);
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (p: ProductoRead) => {
    setEditId(p.id);
    form.reset();
    form.setFieldValue('categoria_id', String(p.categoria_id));
    form.setFieldValue('nombre', p.nombre);
    form.setFieldValue('descripcion', p.descripcion ?? '');
    form.setFieldValue('precio_base', String(p.precio_base));
    form.setFieldValue('imagen_url', p.imagen_url ?? '');
    form.setFieldValue('stock', String(p.stock));
    form.setFieldValue('disponible', p.disponible);
    setError('');
    setModalOpen(true);
  };

  const abrirStock = (p: ProductoRead) => {
    setStockProductId(p.id);
    setStockProductName(p.nombre);
    setStockValue(String(p.stock));
    setStockDisponible(p.disponible);
    setStockError('');
    setStockModalOpen(true);
  };

  const handleStockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockProductId === null) return;
    setStockError('');
    const parsedStock = Number(stockValue);
    if (Number.isNaN(parsedStock) || parsedStock < 0) {
      setStockError('El stock debe ser mayor o igual a 0');
      return;
    }
    try {
      await updateStockMutation.mutateAsync({
        id: stockProductId,
        stock: parsedStock,
        disponible: stockDisponible,
      });
      setStockModalOpen(false);
    } catch (err: unknown) {
      setStockError(err instanceof Error ? err.message : 'Error al actualizar el stock');
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de desactivar este producto?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = useMemo<ColumnDef<ProductoRead>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Producto',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue<string>()}</span>,
      },
      {
        id: 'categoria',
        header: 'Categoría',
        cell: ({ row }) => row.original.categoria?.nombre ?? '—',
      },
      {
        accessorKey: 'precio_base',
        header: 'Precio',
        cell: (info) => (
          <span className="font-medium text-orange-600">
            ${info.getValue<number>().toFixed(2)}
          </span>
        ),
      },
      {
        accessorKey: 'stock',
        header: 'Stock',
      },
      {
        accessorKey: 'disponible',
        header: 'Estado',
        cell: (info) => {
          const disponible = info.getValue<boolean>();
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
      },
      {
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
              <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)} title="Desactivar">
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  const items = useMemo(() => productos?.items ?? [], [productos?.items]);

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
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

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                  <div className="h-5 bg-gray-200 rounded w-48" />
                </div>
              ))}
            </div>
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
        onClose={() => setModalOpen(false)}
        title={editId ? 'Editar producto' : 'Nuevo producto'}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {error}
            </div>
          )}

          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) => (!value ? 'Seleccioná una categoría' : undefined),
            }}
          >
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <select
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
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
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
            }}
          >
            {(field) => (
              <div>
                <Input
                  label="Nombre"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="descripcion">
            {(field) => (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows={2}
                />
              </div>
            )}
          </form.Field>

          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                value === '' || Number(value) < 0 ? 'El precio debe ser >= 0' : undefined,
            }}
          >
            {(field) => (
              <div>
                <Input
                  label="Precio base"
                  type="number"
                  step="0.01"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="imagen_url">
            {(field) => (
              <Input
                label="URL de imagen"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            )}
          </form.Field>

          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                value === '' || Number(value) < 0 ? 'El stock debe ser >= 0' : undefined,
            }}
          >
            {(field) => (
              <div>
                <Input
                  label="Stock"
                  type="number"
                  min="0"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  required
                />
                {field.state.meta.errors.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          </form.Field>

          <form.Field name="disponible">
            {(field) => (
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.state.value}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <span className="text-sm">Disponible</span>
              </label>
            )}
          </form.Field>

          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={createMutation.isPending || updateMutation.isPending}>
              Guardar
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal stock y disponibilidad */}
      <Modal
        open={stockModalOpen}
        onClose={() => setStockModalOpen(false)}
        title={`Stock: ${stockProductName}`}
      >
        <form onSubmit={handleStockSubmit} className="space-y-4">
          {stockError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
              {stockError}
            </div>
          )}
          <Input
            label="Stock"
            type="number"
            min="0"
            value={stockValue}
            onChange={(e) => setStockValue(e.target.value)}
            required
          />
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={stockDisponible}
              onChange={(e) => setStockDisponible(e.target.checked)}
              className="text-orange-600 focus:ring-orange-500"
            />
            <span className="text-sm">Disponible para la venta</span>
          </label>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" type="button" onClick={() => setStockModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={updateStockMutation.isPending}>
              Actualizar stock
            </Button>
          </div>
        </form>
      </Modal>
    </MainLayout>
  );
}
