import { useMemo } from 'react';
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
import { useAuthStore } from '../../../store/authStore';
import { useUsuarios, useActivateUserMutation, useDeactivateUserMutation } from '../hooks/useAdmin';
import type { UsuarioListRead } from '../../../shared/api/types';
import { UserCheck, UserX } from 'lucide-react';

export function AdminUsuariosPage() {
  const { data: usuarios = [], isLoading } = useUsuarios();
  const currentUser = useAuthStore((s) => s.user);
  const activateMutation = useActivateUserMutation();
  const deactivateMutation = useDeactivateUserMutation();

  const handleToggle = (userId: number, disabled: boolean) => {
    if (disabled) {
      if (window.confirm('¿Activar este usuario?')) {
        activateMutation.mutate(userId);
      }
    } else {
      if (window.confirm('¿Desactivar este usuario?')) {
        deactivateMutation.mutate(userId);
      }
    }
  };

  const columns = useMemo<ColumnDef<UsuarioListRead>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'Usuario',
        cell: (info) => <span className="font-medium text-gray-900">@{info.getValue<string>()}</span>,
      },
      {
        accessorKey: 'full_name',
        header: 'Nombre',
      },
      {
        accessorKey: 'email',
        header: 'Email',
      },
      {
        accessorKey: 'role',
        header: 'Rol',
        cell: (info) => {
          const role = info.getValue<string>();
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
      },
      {
        accessorKey: 'disabled',
        header: 'Estado',
        cell: (info) => {
          const disabled = info.getValue<boolean>();
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
      },
      {
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
                onClick={() => handleToggle(u.id, true)}
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
              onClick={() => handleToggle(u.id, false)}
              loading={deactivateMutation.isPending}
            >
              <UserX className="h-4 w-4 mr-1" />
              Desactivar
            </Button>
          );
        },
      },
    ],
    [currentUser?.id, activateMutation.isPending, deactivateMutation.isPending],
  );

  const table = useReactTable({
    data: usuarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Usuarios</h1>
            <p className="text-gray-500 mt-1">Gestioná los usuarios registrados</p>
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
    </MainLayout>
  );
}
