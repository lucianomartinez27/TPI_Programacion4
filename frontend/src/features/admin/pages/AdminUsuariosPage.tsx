import { useCallback, useMemo, useState } from 'react';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type PaginationState,
} from '@tanstack/react-table';
import { UserCheck, UserX } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { AdminSidebar } from '../../../shared/layout/AdminSidebar';
import { Button } from '../../../shared/ui/Button';
import { EstadoError, EstadoVacio, Skeleton } from '../../../shared/components';
import { useAuthStore } from '../../../store/authStore';
import {
  useActivateUserMutation,
  useDeactivateUserMutation,
  useUsuarios,
} from '../hooks/useAdmin';
import type { UsuarioListRead } from '../../../shared/api/types';
import { handleApiError } from '../../../shared/api/handleApiError';

const EMPTY_USUARIOS: UsuarioListRead[] = [];
const columnHelper = createColumnHelper<UsuarioListRead>();

export function AdminUsuariosPage() {
  const { data, isLoading, isError, error, refetch } = useUsuarios();
  const currentUser = useAuthStore((s) => s.user);
  const activateMutation = useActivateUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const [actionError, setActionError] = useState('');
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 10 });

  const usuarios = data ?? EMPTY_USUARIOS;

  const handleToggle = useCallback(
    async (userId: number, disabled: boolean) => {
      setActionError('');
      try {
        if (disabled) {
          if (!window.confirm('¿Activar este usuario?')) return;
          await activateMutation.mutateAsync(userId);
        } else {
          if (!window.confirm('¿Desactivar este usuario?')) return;
          await deactivateMutation.mutateAsync(userId);
        }
      } catch (err: unknown) {
        setActionError(handleApiError(err));
      }
    },
    [activateMutation, deactivateMutation],
  );

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => <span className="font-medium text-gray-900">@{info.getValue()}</span>,
      }),
      columnHelper.accessor('full_name', {
        header: 'Nombre',
      }),
      columnHelper.accessor('email', {
        header: 'Email',
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => {
          const role = info.getValue();
          return (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {role}
            </span>
          );
        },
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) => {
          const disabled = info.getValue();
          return (
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
              }`}
            >
              {disabled ? 'Desactivado' : 'Activo'}
            </span>
          );
        },
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: ({ row }) => {
          const u = row.original;
          const isCurrentUser = currentUser?.id === u.id;
          if (u.disabled) {
            return (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => void handleToggle(u.id, true)}
                loading={activateMutation.isPending}
              >
                <UserCheck className="h-4 w-4 mr-1" />
                Activar
              </Button>
            );
          }
          if (isCurrentUser) {
            return <span className="text-xs text-gray-400">Sesión actual</span>;
          }
          return (
            <Button
              variant="danger"
              size="sm"
              onClick={() => void handleToggle(u.id, false)}
              loading={deactivateMutation.isPending}
            >
              <UserX className="h-4 w-4 mr-1" />
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [currentUser?.id, handleToggle, activateMutation.isPending, deactivateMutation.isPending],
  );

  const table = useReactTable({
    data: usuarios,
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
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 mt-1">Gestioná los usuarios registrados</p>
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
            <EstadoError error={error} onRetry={() => void refetch()} />
          ) : usuarios.length === 0 ? (
            <EstadoVacio
              title="No hay usuarios registrados"
              description="Cuando se registren usuarios aparecerán en esta tabla."
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
    </MainLayout>
  );
}
