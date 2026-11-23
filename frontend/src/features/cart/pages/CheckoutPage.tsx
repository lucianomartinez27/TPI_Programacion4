import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { ArrowRight, ShoppingCart } from 'lucide-react';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { EstadoVacio } from '../../../shared/components';
import { selectCartTotal, useCartStore } from '../../../store/cartStore';
import { useCreatePedidoMutation } from '../hooks/useCartMutations';
import { FormaPago } from '../../../shared/api/types';
import { handleApiError } from '../../../shared/api/handleApiError';

interface CheckoutFormValues {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
}

const defaultValues: CheckoutFormValues = {
  direccion_entrega: '',
  forma_pago: FormaPago.EFECTIVO,
  notas: '',
};

function parseFormaPago(value: string): FormaPago {
  return value === FormaPago.TRANSFERENCIA ? FormaPago.TRANSFERENCIA : FormaPago.EFECTIVO;
}

export function CheckoutPage() {
  const items = useCartStore((s) => s.items);
  const total = useCartStore(selectCartTotal);
  const navigate = useNavigate();
  const createPedido = useCreatePedidoMutation();
  const [submitError, setSubmitError] = useState('');

  const form = useForm({
    defaultValues,
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
        setSubmitError(handleApiError(err));
      }
    },
  });

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto mt-12">
          <EstadoVacio
            icon={<ShoppingCart className="h-14 w-14" />}
            title="Tu carrito está vacío"
            description="Agregá productos antes de confirmar tu pedido."
            action={
              <Link
                to="/"
                className="inline-flex items-center justify-center px-5 py-2.5 text-sm font-medium rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
              >
                Ir al catálogo
              </Link>
            }
          />
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
          <Card title="Datos de entrega">
            <form
              noValidate
              onSubmit={(e) => {
                e.preventDefault();
                e.stopPropagation();
                void form.handleSubmit();
              }}
              className="space-y-4"
            >
              {submitError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2"
                >
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
                  onBlur: ({ value }) => {
                    const len = value.trim().length;
                    if (len < 5) return 'La dirección debe tener al menos 5 caracteres';
                    if (len > 200) return 'La dirección no puede superar los 200 caracteres';
                    return undefined;
                  },
                }}
              >
                {(field) => {
                  const fieldError = field.state.meta.errors.filter(Boolean).map(String).join(', ');
                  return (
                    <Input
                      label="Dirección de entrega"
                      name={field.name}
                      type="text"
                      placeholder="Ej: Av. Colón 1234, Piso 2"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      error={fieldError || undefined}
                    />
                  );
                }}
              </form.Field>

              <form.Field name="forma_pago">
                {(field) => (
                  <div>
                    <label
                      htmlFor="forma-pago"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Forma de pago
                    </label>
                    <select
                      id="forma-pago"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(parseFormaPago(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-brand bg-white"
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
                    <label
                      htmlFor="notas-pedido"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Notas (opcional)
                    </label>
                    <textarea
                      id="notas-pedido"
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="Instrucciones adicionales para el repartidor..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-brand"
                      rows={3}
                    />
                  </div>
                )}
              </form.Field>

              <div className="flex gap-3 pt-2">
                <Link
                  to="/carrito"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
                >
                  Volver al carrito
                </Link>
                <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting] as const}>
                  {([canSubmit, isSubmitting]) => (
                    <Button
                      type="submit"
                      className="flex-1"
                      disabled={!canSubmit}
                      loading={isSubmitting || createPedido.isPending}
                    >
                      Confirmar pedido
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  )}
                </form.Subscribe>
              </div>
            </form>
          </Card>
        </div>

        <div>
          <Card title="Resumen del pedido">
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
              <span className="text-brand">${total.toFixed(2)}</span>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
