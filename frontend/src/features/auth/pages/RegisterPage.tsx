import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { UserPlus } from 'lucide-react';
import { authApi } from '../api/auth.api';
import { handleApiError } from '@/shared/api/handleApiError';
import { useNotificationStore } from '@/store/notificationStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { Input } from '@/shared/ui/Input';

export function RegisterPage() {
  const navigate = useNavigate();
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      username: '',
      full_name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        await authApi.register({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });
        showNotification(
          'Cuenta creada con éxito. Ahora podés iniciar sesión.',
          'success',
        );
        navigate('/login', { replace: true });
      } catch (error) {
        setServerError(handleApiError(error));
      }
    },
  });

  return (
    <div className="mx-auto flex max-w-md flex-col justify-center py-8">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-600 text-white shadow-sm">
          <UserPlus className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold text-stone-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-stone-500">
          Registrate como cliente para confirmar tus pedidos en Food Store.
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
              onChange: ({ value }) => {
                const v = value.trim();
                if (!v) return 'El nombre de usuario es obligatorio.';
                if (v.length < 3) return 'Mínimo 3 caracteres.';
                if (v.length > 50) return 'Máximo 50 caracteres.';
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Nombre de usuario"
                name={field.name}
                placeholder="ej. juanperez"
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
            name="full_name"
            validators={{
              onChange: ({ value }) => {
                const v = value.trim();
                if (!v) return 'El nombre completo es obligatorio.';
                if (v.length < 2) return 'Mínimo 2 caracteres.';
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Nombre completo"
                name={field.name}
                placeholder="ej. Juan Pérez"
                autoComplete="name"
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
            name="email"
            validators={{
              onChange: ({ value }) => {
                const v = value.trim();
                if (!v) return 'El email es obligatorio.';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) {
                  return 'Ingresá un correo electrónico válido.';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Correo electrónico"
                name={field.name}
                type="email"
                placeholder="juan@ejemplo.com"
                autoComplete="email"
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
              onChange: ({ value }) => {
                if (!value) return 'La contraseña es obligatoria.';
                if (value.length < 8) return 'Debe tener al menos 8 caracteres.';
                if (new TextEncoder().encode(value).length > 72) {
                  return 'No puede superar los 72 caracteres.';
                }
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Contraseña"
                name={field.name}
                type="password"
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
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
            name="confirmPassword"
            validators={{
              onChangeListenTo: ['password'],
              onChange: ({ value, fieldApi }) => {
                const pass = fieldApi.form.getFieldValue('password');
                if (!value) return 'Confirmá tu contraseña.';
                if (value !== pass) return 'Las contraseñas no coinciden.';
                return undefined;
              },
            }}
          >
            {(field) => (
              <Input
                label="Confirmar contraseña"
                name={field.name}
                type="password"
                placeholder="Repetí tu contraseña"
                autoComplete="new-password"
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
                Crear cuenta
              </Button>
            )}
          </form.Subscribe>
        </form>

        <p className="mt-5 text-center text-sm text-stone-600">
          ¿Ya tenés cuenta?{' '}
          <Link
            to="/login"
            className="font-semibold text-orange-600 hover:text-orange-700"
          >
            Iniciar sesión
          </Link>
        </p>
      </Card>
    </div>
  );
}
