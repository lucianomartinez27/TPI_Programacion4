import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { Package } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useLoginMutation } from '../hooks/useAuthMutations';
import { handleApiError } from '../../../shared/api/handleApiError';

interface LocationState {
  from?: { pathname?: string };
  message?: string;
}

interface LoginFormValues {
  username: string;
  password: string;
}

const defaultValues: LoginFormValues = {
  username: '',
  password: '',
};

export function LoginPage() {
  const [error, setError] = useState('');
  const loginMutation = useLoginMutation();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const from = state?.from?.pathname || '/';
  const successMessage = state?.message;

  const form = useForm({
    defaultValues,
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
                <Package className="h-8 w-8 text-brand" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Iniciar sesión</h1>
            <p className="text-sm text-gray-500 mt-1">
              Accedé a tu cuenta para hacer pedidos
            </p>
          </div>

          <form
            noValidate
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
              <div
                role="alert"
                className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2"
              >
                {error}
              </div>
            )}

            <form.Field
              name="username"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length === 0 ? 'Ingresá tu usuario' : undefined,
                onBlur: ({ value }) =>
                  value.trim().length === 0 ? 'Ingresá tu usuario' : undefined,
              }}
            >
              {(field) => {
                const fieldError = field.state.meta.errors
                  .filter(Boolean)
                  .map(String)
                  .join(', ');
                return (
                  <Input
                    label="Usuario"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError || undefined}
                    autoComplete="username"
                  />
                );
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) =>
                  value.length === 0 ? 'Ingresá tu contraseña' : undefined,
                onBlur: ({ value }) =>
                  value.length === 0 ? 'Ingresá tu contraseña' : undefined,
              }}
            >
              {(field) => {
                const fieldError = field.state.meta.errors
                  .filter(Boolean)
                  .map(String)
                  .join(', ');
                return (
                  <Input
                    label="Contraseña"
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError || undefined}
                    autoComplete="current-password"
                  />
                );
              }}
            </form.Field>

            <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
              {([canSubmit, isSubmitting]) => (
                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canSubmit}
                  loading={isSubmitting || loginMutation.isPending}
                >
                  Iniciar sesión
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿No tenés cuenta?{' '}
            <Link to="/register" className="text-brand hover:underline font-medium">
              Registrarse
            </Link>
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
