import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../../shared/layout/MainLayout';
import { Card } from '../../../shared/ui/Card';
import { Button } from '../../../shared/ui/Button';
import { useCartStore } from '../../../store/cartStore';
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight } from 'lucide-react';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const quitarItem = useCartStore((s) => s.quitarItem);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const navigate = useNavigate();

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
                  <p className="text-orange-600 font-medium">${(item.precio_base ?? 0).toFixed(2)}</p>
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
                  <p className="font-semibold">${((item.precio_base ?? 0) * item.cantidad).toFixed(2)}</p>
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

        {/* Resumen */}
        <div>
          <Card title="Resumen" className="sticky top-24">
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 border-t pt-3">
                <span>Total</span>
                <span className="text-orange-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Button
                className="w-full"
                size="lg"
                onClick={() => navigate('/checkout')}
              >
                Continuar al checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={vaciar}
              >
                Vaciar carrito
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
