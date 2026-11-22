import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { useRegisterMutation } from '../hooks/useAuthMutations';
import { Package } from 'lucide-react';

export function RegisterPage() {
  const [error, setError] = useState('');
  const registerMutation = useRegisterMutation();
  const navigate = useNavigate();

  const form = useForm({
    defaultValues: {
      username: '',
      email: '',
      full_name: '',
      password: '',
    },
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
        setError(err instanceof Error ? err.message : 'Error al registrar');
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
            <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
            <p className="text-sm text-gray-500 mt-1">
              Registrate para empezar a hacer pedidos
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
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
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
                    minLength={2}
                    maxLength={50}
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onChange: ({ value }) =>
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
                    ? 'Ingresá un email válido'
                    : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                  />
                  {field.state.meta.errors.length > 0 && (
                    <p className="text-xs text-red-600 mt-1">{field.state.meta.errors[0]}</p>
                  )}
                </div>
              )}
            </form.Field>

            <form.Field
              name="full_name"
              validators={{
                onChange: ({ value }) =>
                  value.trim().length < 2 ? 'Mínimo 2 caracteres' : undefined,
              }}
            >
              {(field) => (
                <div>
                  <Input
                    label="Nombre completo"
                    type="text"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    required
                    minLength={2}
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
                  value.length < 8 ? 'La contraseña debe tener al menos 8 caracteres' : undefined,
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
                    minLength={8}
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
              loading={registerMutation.isPending}
            >
              Registrarse
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-4">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="text-orange-600 hover:underline font-medium">
              Iniciar sesión
            </Link>
          </p>
        </Card>
      </div>
    </MainLayout>
  );
}
