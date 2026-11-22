import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { Input } from '../../../shared/ui/Input';
import { useCartStore } from '../../../store/cartStore';
import { useCreatePedidoMutation } from '../hooks/useCartMutations';
import { FormaPago } from '../../../shared/api/types';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const quitarItem = useCartStore((s) => s.quitarItem);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const total = useCartStore((s) => s.total());
  const navigate = useNavigate();
  const createPedido = useCreatePedidoMutation();

  const [direccion, setDireccion] = useState('');
  const [notas, setNotas] = useState('');
  const [formaPago, setFormaPago] = useState<FormaPago>(FormaPago.EFECTIVO);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    if (items.length === 0) {
      setError('El carrito está vacío');
      return;
    }
    if (direccion.length < 5) {
      setError('La dirección debe tener al menos 5 caracteres');
      return;
    }
    try {
      await createPedido.mutateAsync({
        forma_pago: formaPago,
        direccion_entrega: direccion,
        notas: notas || undefined,
        items: items.map((i) => ({ producto_id: i.producto_id, cantidad: i.cantidad })),
      });
      navigate('/orders');
    } catch (err: any) {
      setError(err.message || 'Error al crear el pedido');
    }
  };

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <ShoppingCart className="h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-xl font-semibold text-gray-700">Tu carrito está vacío</h2>
          <p className="text-gray-500 mt-1 mb-6">Explorá el catálogo para agregar productos</p>
          <Button onClick={() => navigate('/')}>Ir al catálogo</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Carrito</h1>
        <p className="text-gray-500 mt-1">{items.length} producto(s) en el carrito</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items del carrito */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.producto_id}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center overflow-hidden">
                  {item.imagen_url ? (
                    <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍔</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{item.nombre}</h3>
                  <p className="text-orange-600 font-medium">${item.precio_base.toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.cantidad}</span>
                  <button
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    className="p-1 rounded hover:bg-gray-100"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right min-w-[80px]">
                  <p className="font-semibold">${(item.precio_base * item.cantidad).toFixed(2)}</p>
                </div>
                <button
                  onClick={() => quitarItem(item.producto_id)}
                  className="p-2 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Resumen y checkout */}
        <div>
          <Card title="Resumen" className="sticky top-24">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                <span>Total</span>
                <span className="text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2">
                  {error}
                </div>
              )}

              <Input
                label="Dirección de entrega"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                required
                minLength={5}
                maxLength={200}
                placeholder="Calle 123, Ciudad"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de pago
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="formaPago"
                      value={FormaPago.EFECTIVO}
                      checked={formaPago === FormaPago.EFECTIVO}
                      onChange={() => setFormaPago(FormaPago.EFECTIVO)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">Efectivo</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="formaPago"
                      value={FormaPago.TRANSFERENCIA}
                      checked={formaPago === FormaPago.TRANSFERENCIA}
                      onChange={() => setFormaPago(FormaPago.TRANSFERENCIA)}
                      className="text-orange-600 focus:ring-orange-500"
                    />
                    <span className="text-sm">Transferencia</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={notas}
                  onChange={(e) => setNotas(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Instrucciones especiales..."
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={createPedido.isPending}
                size="lg"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Confirmar pedido
              </Button>
            </form>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
