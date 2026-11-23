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
import { UserCheck, UserX } from 'lucide-react';
import {
  useActivarUsuario,
  useDesactivarUsuario,
  useUsuarios,
} from '../hooks/useUsuarios';
import type { UserPublic } from '../types/usuario.types';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { TablaSkeleton } from '@/shared/components/Skeleton';
import { EstadoError } from '@/shared/components/EstadoError';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

const columnHelper = createColumnHelper<UserPublic>();
const usuariosVacios: UserPublic[] = [];

export function AdminUsuariosPage() {
  const usuarioSesion = useAuthStore((s) => s.usuario);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const usuariosQuery = useUsuarios();
  const activarMutation = useActivarUsuario();
  const desactivarMutation = useDesactivarUsuario();

  const [procesandoId, setProcesandoId] = useState<number | null>(null);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const handleActivar = async (user: UserPublic) => {
    setProcesandoId(user.id);
    try {
      await activarMutation.mutateAsync(user.id);
      showNotification(`Usuario @${user.username} activado.`, 'success');
    } catch (error) {
      showNotification(handleApiError(error), 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const handleDesactivar = async (user: UserPublic) => {
    const ok = window.confirm(
      `¿Desactivar la cuenta de @${user.username}? No podrá iniciar sesión ni operar hasta reactivarla.`,
    );
    if (!ok) return;
    setProcesandoId(user.id);
    try {
      await desactivarMutation.mutateAsync(user.id);
      showNotification(`Usuario @${user.username} desactivado.`, 'info');
    } catch (error) {
      showNotification(handleApiError(error), 'error');
    } finally {
      setProcesandoId(null);
    }
  };

  const columns = useMemo(
    () => [
      columnHelper.accessor('username', {
        header: 'Usuario',
        cell: (info) => (
          <span className="font-mono font-semibold text-stone-900">
            @{info.getValue()}
          </span>
        ),
      }),
      columnHelper.accessor('full_name', {
        header: 'Nombre',
        cell: (info) => (
          <span className="text-stone-800">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('email', {
        header: 'Email',
        cell: (info) => (
          <span className="text-stone-600">{info.getValue()}</span>
        ),
      }),
      columnHelper.accessor('role', {
        header: 'Rol',
        cell: (info) => {
          const rol = info.getValue();
          return (
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                rol === 'admin'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-stone-100 text-stone-700'
              }`}
            >
              {rol}
            </span>
          );
        },
      }),
      columnHelper.accessor('disabled', {
        header: 'Estado',
        cell: (info) =>
          info.getValue() ? (
            <span className="inline-flex rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-800">
              Desactivado
            </span>
          ) : (
            <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800">
              Activo
            </span>
          ),
      }),
      columnHelper.display({
        id: 'acciones',
        header: 'Acciones',
        cell: (info) => {
          const user = info.row.original;
          const esPropio = usuarioSesion?.id === user.id;
          const ocupado = procesandoId === user.id;

          if (esPropio) {
            return (
              <span className="text-xs font-medium italic text-stone-400">
                Sesión actual
              </span>
            );
          }

          return user.disabled ? (
            <Button
              variant="success"
              size="sm"
              isLoading={ocupado}
              onClick={() => void handleActivar(user)}
            >
              <UserCheck className="h-3.5 w-3.5" />
              Activar
            </Button>
          ) : (
            <Button
              variant="danger"
              size="sm"
              isLoading={ocupado}
              onClick={() => void handleDesactivar(user)}
            >
              <UserX className="h-3.5 w-3.5" />
              Desactivar
            </Button>
          );
        },
      }),
    ],
    [usuarioSesion?.id, procesandoId],
  );

  const table = useReactTable({
    data: usuariosQuery.data ?? usuariosVacios,
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
          Gestión de usuarios
        </h1>
        <p className="text-sm text-stone-500">
          Consultá las cuentas registradas y activá o desactivá accesos.
        </p>
      </div>

      {usuariosQuery.isPending ? (
        <TablaSkeleton />
      ) : usuariosQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(usuariosQuery.error)}
          onReintentar={() => void usuariosQuery.refetch()}
        />
      ) : usuariosQuery.data.length === 0 ? (
        <EstadoVacio titulo="No hay usuarios registrados" />
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
              {Math.max(1, table.getPageCount())} ({usuariosQuery.data.length}{' '}
              usuarios)
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
    </div>
  );
}
