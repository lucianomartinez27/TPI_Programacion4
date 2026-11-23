import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Role } from '@/features/auth/types/auth.types';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  allowedRoles?: Role[];
}

export function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((s) => s.usuario);
  const cargando = useAuthStore((s) => s.cargando);
  const location = useLocation();

  if (cargando) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 text-stone-600">
        <span className="h-8 w-8 animate-spin rounded-full border-4 border-orange-600 border-t-transparent" />
        <p className="text-sm font-medium">Verificando sesión...</p>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
