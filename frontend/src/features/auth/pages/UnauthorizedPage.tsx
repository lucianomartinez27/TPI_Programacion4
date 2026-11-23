import { Link } from 'react-router-dom';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Button } from '@/shared/ui/Button';
import { ShieldAlert } from 'lucide-react';

export function UnauthorizedPage() {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-red-100 p-4 rounded-full mb-4">
          <ShieldAlert className="h-10 w-10 text-red-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Acceso no autorizado</h1>
        <p className="text-gray-500 mt-2 mb-6 max-w-md">
          No tenés permisos suficientes para acceder a esta sección.
        </p>
        <Link to="/">
          <Button>Volver al inicio</Button>
        </Link>
      </div>
    </MainLayout>
  );
}
