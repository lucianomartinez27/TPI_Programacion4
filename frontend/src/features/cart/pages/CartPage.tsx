import { Link } from 'react-router-dom';
import { ArrowRight, Minus, Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { EstadoVacio } from '@/shared/components';
import { selectCartTotal, useCartStore } from '@/store/cartStore';

export function CartPage() {
  const items = useCartStore((s) => s.items);
  const quitarItem = useCartStore((s) => s.quitarItem);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore(selectCartTotal);

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="max-w-xl mx-auto mt-12">
          <EstadoVacio
            icon={<ShoppingCart className="h-14 w-14" />}
            title="Tu carrito está vacío"
            description="Explorá el catálogo para agregar productos a tu pedido."
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
        <h1 className="text-3xl font-bold text-gray-900">Carrito</h1>
        <p className="text-gray-500 mt-1">{items.length} producto(s) en el carrito</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items del carrito */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item.producto_id}>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gray-100 rounded-lg shrink-0 flex items-center justify-center overflow-hidden">
                  {item.imagen_url ? (
                    <img src={item.imagen_url} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-2xl">🍔</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/productos/${item.producto_id}`}
                    className="font-semibold text-gray-900 hover:text-brand truncate block"
                  >
                    {item.nombre}
                  </Link>
                  <p className="text-brand font-medium">${(item.precio_base ?? 0).toFixed(2)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad - 1)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Disminuir cantidad"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-8 text-center font-medium">{item.cantidad}</span>
                  <button
                    type="button"
                    onClick={() => cambiarCantidad(item.producto_id, item.cantidad + 1)}
                    className="p-1 rounded hover:bg-gray-100"
                    aria-label="Aumentar cantidad"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <div className="text-right min-w-20">
                  <p className="font-semibold">${((item.precio_base ?? 0) * item.cantidad).toFixed(2)}</p>
                </div>
                <button
                  type="button"
                  onClick={() => quitarItem(item.producto_id)}
                  className="p-2 text-gray-400 hover:text-error"
                  aria-label="Quitar del carrito"
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
                <span className="text-brand">${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                to="/checkout"
                className="w-full inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-lg bg-brand text-white hover:bg-brand-hover transition-colors"
              >
                Continuar al checkout
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Button variant="secondary" className="w-full" onClick={vaciar}>
                Vaciar carrito
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}
