import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { UtensilsCrossed } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);

  const state = location.state as LocationState | null;
  const from = state?.from?.pathname;

  const form = useForm({
    defaultValues: {
      username: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const usuario = await login(value.username.trim(), value.password);
        showNotification(`¡Bienvenido, ${usuario.full_name}!`, 'success');
        if (from && from !== '/login') {
          navigate(from, { replace: true });
        } else {
          navigate(usuario.role === 'admin' ? '/admin/resumen' : '/', {
            replace: true,
          });
        }
      } catch (error) {
        setServerError(handleApiError(error));
      }
    },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm">
          <UtensilsCrossed className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Iniciar sesión</h1>
        <p className="mt-1 text-sm text-stone-500">
          Ingresá con tu cuenta para hacer pedidos o gestionar la tienda.
        </p>
      </div>

      <Card className="p-6">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
          className="space-y-4"
        >
          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                !value.trim() ? 'El nombre de usuario es obligatorio.' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Usuario"
                name={field.name}
                placeholder="ej. admin o tu_usuario"
                autoComplete="username"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                !value ? 'La contraseña es obligatoria.' : undefined,
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                name={field.name}
                type="password"
                placeholder="••••••••"
                autoComplete="current-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                error={
                  field.state.meta.errors.length > 0
                    ? String(field.state.meta.errors[0])
                    : undefined
                }
              />
            )}
          </form.Field>

          <form.Subscribe
            selector={(s) => [s.canSubmit, s.isSubmitting] as const}
          >
            {([canSubmit, isSubmitting]) => (
              <Button
                type="submit"
                className="w-full"
                disabled={!canSubmit}
                isLoading={isSubmitting}
              >
                Ingresar
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-600">
          ¿Todavía no tenés cuenta?{' '}
          <Link
            to="/register"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Registrate aquí
          </Link>
        </p>
      </Card>
    </div>
  );
}
