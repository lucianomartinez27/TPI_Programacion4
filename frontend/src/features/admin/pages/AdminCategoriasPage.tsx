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
import {
  useAllCategorias,
  useCreateCategoriaMutation,
  useUpdateCategoriaMutation,
  useDeleteCategoriaMutation,
} from '../hooks/useAdmin';
import type { CategoriaRead } from '../../../shared/api/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export function AdminCategoriasPage() {
  const { data: categorias = [], isLoading } = useAllCategorias();
  const createMutation = useCreateCategoriaMutation();
  const updateMutation = useUpdateCategoriaMutation();
  const deleteMutation = useDeleteCategoriaMutation();

  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState('');

  const form = useForm({
    defaultValues: {
      nombre: '',
      descripcion: '',
    },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        if (editId) {
          await updateMutation.mutateAsync({
            id: editId,
            data: { nombre: value.nombre.trim(), descripcion: value.descripcion.trim() || undefined },
          });
        } else {
          await createMutation.mutateAsync({
            nombre: value.nombre.trim(),
            descripcion: value.descripcion.trim() || undefined,
          });
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
    form.setFieldValue('nombre', '');
    form.setFieldValue('descripcion', '');
    setError('');
    setModalOpen(true);
  };

  const abrirEditar = (cat: CategoriaRead) => {
    setEditId(cat.id);
    form.reset();
    form.setFieldValue('nombre', cat.nombre);
    form.setFieldValue('descripcion', cat.descripcion ?? '');
    setError('');
    setModalOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('¿Estás seguro de desactivar esta categoría?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = useMemo<ColumnDef<CategoriaRead>[]>(
    () => [
      {
        accessorKey: 'nombre',
        header: 'Nombre',
        cell: (info) => <span className="font-medium text-gray-900">{info.getValue<string>()}</span>,
      },
      {
        accessorKey: 'descripcion',
        header: 'Descripción',
        cell: (info) => info.getValue<string | null>() ?? '—',
      },
      {
        accessorKey: 'activo',
        header: 'Estado',
        cell: (info) => {
          const activo = info.getValue<boolean>();
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
      },
      {
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const cat = row.original;
          return (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => abrirEditar(cat)}>
                <Edit2 className="h-4 w-4" />
              </Button>
              {cat.activo && (
                <Button variant="ghost" size="sm" onClick={() => handleDelete(cat.id)}>
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              )}
            </div>
          );
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    data: categorias,
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
              <h1 className="text-3xl font-bold text-gray-900">Categorías</h1>
              <p className="text-gray-500 mt-1">Gestioná las categorías de productos</p>
            </div>
            <Button onClick={abrirCrear}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva categoría
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
        title={editId ? 'Editar categoría' : 'Nueva categoría'}
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
            name="nombre"
            validators={{
              onChange: ({ value }) => {
                const len = value.trim().length;
                if (len < 2) return 'Mínimo 2 caracteres';
                if (len > 100) return 'Máximo 100 caracteres';
                return undefined;
              },
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
                  rows={3}
                />
              </div>
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
    </MainLayout>
  );
}
