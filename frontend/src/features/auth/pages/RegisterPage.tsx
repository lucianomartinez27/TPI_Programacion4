import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { Package } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Input } from '@/shared/ui/Input';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { useRegisterMutation } from '@/features/auth/hooks/useAuthMutations';
import { handleApiError } from '@/shared/api/handleApiError';

interface RegisterFormValues {
  username: string;
  email: string;
  full_name: string;
  password: string;
}

const defaultValues: RegisterFormValues = {
  username: '',
  email: '',
  full_name: '',
  password: '',
};

const utf8ByteLength = (str: string) => new TextEncoder().encode(str).length;

function validatePassword(value: string): string | undefined {
  if (value.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (utf8ByteLength(value) > 72) return 'La contraseña no puede superar los 72 bytes';
  return undefined;
}

export function RegisterPage() {
  const [error, setError] = useState('');
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setError('');
      try {
        await registerMutation.mutateAsync({
          username: value.username.trim(),
          email: value.email.trim(),
          full_name: value.full_name.trim(),
          password: value.password,
        });
        navigate('/login', { state: { message: 'Registro exitoso. Iniciá sesión.' } });
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
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">
              Registrate para empezar a hacer pedidos
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
                onChange: ({ value }) => {
                  const len = value.trim().length;
                  if (len < 2) return 'Mínimo 2 caracteres';
                  if (len > 50) return 'Máximo 50 caracteres';
                  return undefined;
                },
                onBlur: ({ value }) => {
                  const len = value.trim().length;
                  if (len < 2) return 'Mínimo 2 caracteres';
                  if (len > 50) return 'Máximo 50 caracteres';
                  return undefined;
                },
              }}
            >
              {(field) => {
                const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
                return (
                  <Input
                    label="Usuario"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError || undefined}
                    maxLength={50}
                    autoComplete="username"
                  />
                );
              }}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                    ? 'Ingresá un email válido'
                    : undefined,
                onBlur: ({ value }) =>
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                    ? 'Ingresá un email válido'
                    : undefined,
              }}
            >
              {(field) => {
                const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
                return (
                  <Input
                    label="Email"
                    name={field.name}
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError || undefined}
                    autoComplete="email"
                  />
                );
              }}
            </form.Field>

            <form.Field
              name="full_name"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
                onBlur: ({ value }) =>
                  value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
              }}
            >
              {(field) => {
                const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
                return (
                  <Input
                    label="Nombre completo"
                    name={field.name}
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError || undefined}
                    maxLength={100}
                    autoComplete="name"
                  />
                );
              }}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onChange: ({ value }) => validatePassword(value),
                onBlur: ({ value }) => validatePassword(value),
              }}
            >
              {(field) => {
                const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
                return (
                  <Input
                    label="Contraseña"
                    name={field.name}
                    type="password"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    error={fieldError || undefined}
                    maxLength={72}
                    autoComplete="new-password"
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
                  loading={isSubmitting || registerMutation.isPending}
                >
                  Registrarse
                </Button>
              )}
            </form.Subscribe>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-brand hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
