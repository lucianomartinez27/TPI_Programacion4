import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { useUsuarios, useActivateUserMutation, useDeactivateUserMutation } from '../hooks/useAdmin';
import { UserCheck, UserX } from 'lucide-react';

export function AdminUsuariosPage() {
  const { data: usuarios, isLoading } = useUsuarios();
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

  return (
    <MainLayout>
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
        <div className="space-y-3">
          {usuarios?.map((u) => (
            <Card key={u.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-gray-900">{u.full_name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {u.role}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      u.disabled ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {u.disabled ? 'Desactivado' : 'Activo'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    @{u.username} · {u.email}
                  </p>
                </div>
                <div className="flex gap-2">
                  {u.disabled ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleToggle(u.id, true)}
                      loading={activateMutation.isPending}
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      Activar
                    </Button>
                  ) : (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleToggle(u.id, false)}
                      loading={deactivateMutation.isPending}
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      Desactivar
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </MainLayout>
  );
}
