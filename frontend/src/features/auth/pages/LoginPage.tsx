import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { handleApiError } from '../../../shared/api/handleApiError';
import { Package } from 'lucide-react';

interface LocationState {
  from?: { pathname?: string };
  message?: string;
}

export function LoginPage() {
  const [error, setError] = useState('');
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || '/';
  const successMessage = state?.message;

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setError('');
      try {
        await loginMutation.mutateAsync({
          username: value.username.trim(),
          password: value.password,
        });
        navigate(from, { replace: true });
      } catch (err: unknown) {
        setError(handleApiError(err));
      }
    },
  });

  return (
    <MainLayout>
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="w-full max-w-md">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-3">
              <div className="bg-orange-100 p-3 rounded-full">
                <Package className="h-8 w-8 text-orange-600" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-sm text-gray-500 mt-1">
              Accede a tu cuenta para hacer pedidos
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              void form.handleSubmit();
            }}
            className="space-y-4"
          >
            {successMessage && (
              <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-2">
                {successMessage}
              </div>
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
                {error}
              </div>
            )}

            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length === 0 ? 'Ingresá tu usuario' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Input
                    label="Usuario"
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    autoComplete="username"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  value.length === 0 ? 'Ingresá tu contraseña' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Input
                    label="Contraseña"
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <Button
              type="submit"
              className="w-full"
              loading={loginMutation.isPending}
            >
              Iniciar sesión
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-orange-600 hover:underline font-medium">
              Registrarse
            </Link>
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
