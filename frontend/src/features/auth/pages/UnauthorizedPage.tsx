import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';
import { Button } from '@/shared/ui/Button';

export function UnauthorizedPage() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-red-100 p-4 text-red-600">
        <ShieldAlert className="h-10 w-10" />
      </div>
      <h1 className="text-2xl font-bold text-stone-900">Acceso denegado</h1>
      <p className="mt-2 text-sm text-stone-600">
        No tenés los permisos necesarios para acceder a esta sección. Si creés
        que es un error, contactá con un administrador.
      </p>
      <Link to="/" className="mt-6">
        <Button>Volver al inicio</Button>
      </Link>
    </div>
  );
}
