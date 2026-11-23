import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useCartStore } from '../../../store/cartStore';
import { useCreatePedidoMutation } from '../hooks/useCartMutations';
import { FormaPago } from '../../../shared/api/types';
import { ShoppingCart, ArrowRight } from 'lucide-react';

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore((s) => s.total());
  const navigate = useNavigate();
  const createPedido = useCreatePedidoMutation();
  const [submitError, setSubmitError] = useState('');

  const form = useForm({
    defaultValues: {
      direccion_entrega: '',
      forma_pago: FormaPago.EFECTIVO as FormaPago,
      notas: '',
    },
    onSubmit: async ({ value }) => {
      setSubmitError('');
      if (items.length === 0) {
        setSubmitError('El carrito está vacío');
        return;
      }
      try {
        await createPedido.mutateAsync({
          forma_pago: value.forma_pago,
          direccion_entrega: value.direccion_entrega.trim(),
          notas: value.notas.trim() || undefined,
          items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
        });
        navigate('/mis-pedidos');
      } catch (err: unknown) {
        setSubmitError(err instanceof Error ? err.message : 'Error al crear el pedido');
      }
    },
  });

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Tu carrito está vacío</h2>
          <p className="text-gray-500 mt-1 mb-6">Agregá productos antes de confirmar tu pedido</p>
          <Button onClick={() => navigate('/')}>Ir al catálogo</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Confirmar pedido</h1>
        <p className="text-gray-500 mt-1">Completá los datos de entrega para finalizar tu compra</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Datos de entrega</h2>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="space-y-4"
            >
              {submitError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
                  {submitError}
                </div>
              )}

              <form.Field
                name="direccion_entrega"
                validators={{
                  onChange: ({ value }) => {
                    const len = value.trim().length;
                    if (len < 5) return 'La dirección debe tener al menos 5 caracteres';
                    if (len > 200) return 'La dirección no puede superar los 200 caracteres';
                    return undefined;
                  },
                }}
              >
                {(field) => (
                  <div>
                    <Input
                      label="Dirección de entrega"
                      type="text"
                      placeholder="Ej: Av. Colón 1234, Piso 2"
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

              <form.Field name="forma_pago">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Forma de pago
                    </label>
                    <select
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value as FormaPago)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                    >
                      <option value={FormaPago.EFECTIVO}>Efectivo</option>
                      <option value={FormaPago.TRANSFERENCIA}>Transferencia</option>
                    </select>
                  </div>
                )}
              </form.Field>

              <form.Field name="notas">
                {(field) => (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notas (opcional)
                    </label>
                    <textarea
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Instrucciones adicionales para el repartidor..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      rows={3}
                    />
                  </div>
                )}
              </form.Field>

              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => navigate('/carrito')}
                >
                  Volver al carrito
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  loading={createPedido.isPending}
                >
                  Confirmar pedido
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Resumen del pedido</h2>
            <div className="space-y-3 border-b border-gray-100 pb-4 mb-4">
              {items.map((item) => (
                <div key={item.producto_id} className="flex justify-between text-sm">
                  <span className="text-gray-700">
                    {item.nombre} × {item.cantidad}
                  </span>
                  <span className="font-medium">
                    ${((item.precio_base ?? 0) * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>Total</span>
              <span className="text-orange-600">${total.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
