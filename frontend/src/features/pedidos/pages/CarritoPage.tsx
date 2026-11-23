import { Link } from 'react-router-dom';
import { Minus, Plus, ShoppingCart, Trash2, UtensilsCrossed } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrecio } from '@/shared/utils/formatters';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';
import { EstadoVacio } from '@/shared/components/EstadoVacio';

export function CarritoPage() {
  const items = useCartStore((s) => s.items);
  const cambiarCantidad = useCartStore((s) => s.cambiarCantidad);
  const quitar = useCartStore((s) => s.quitar);
  const vaciar = useCartStore((s) => s.vaciar);
  const total = useCartStore((s) => s.total());
  const usuario = useAuthStore((s) => s.usuario);

  if (items.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-stone-900">Tu carrito</h1>
        <EstadoVacio
          titulo="Tu carrito está vacío"
          descripcion="Explorá el catálogo de Food Store y agregá tus comidas favoritas para armar un pedido."
          accion={
            <Link to="/">
              <Button>
                <ShoppingCart className="h-4 w-4" />
                Ir al catálogo
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Tu carrito</h1>
          <p className="text-sm text-stone-500">
            Revisá los productos y cantidades antes de confirmar tu pedido.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={vaciar}>
          <Trash2 className="h-4 w-4" />
          Vaciar carrito
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {items.map((item) => {
            const subtotal = item.precio_unitario * item.cantidad;
            const enLimite =
              item.stock_disponible !== undefined &&
              item.cantidad >= item.stock_disponible;

            return (
              <Card
                key={item.producto_id}
                className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center"
              >
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-stone-100">
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-stone-400">
                      <UtensilsCrossed className="h-7 w-7" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <h3 className="font-semibold text-stone-900">{item.nombre}</h3>
                  <p className="text-sm text-stone-500">
                    {formatPrecio(item.precio_unitario)} c/u
                  </p>
                  {item.stock_disponible !== undefined && (
                    <p className="text-xs text-stone-400">
                      Stock disponible: {item.stock_disponible}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-4 sm:justify-end">
                  <div className="flex items-center rounded-lg border border-stone-200">
                    <button
                      type="button"
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad - 1)
                      }
                      className="p-2 text-stone-600 hover:bg-stone-100 cursor-pointer"
                      aria-label="Restar cantidad"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-9 text-center text-sm font-semibold text-stone-900">
                      {item.cantidad}
                    </span>
                    <button
                      type="button"
                      disabled={enLimite}
                      onClick={() =>
                        cambiarCantidad(item.producto_id, item.cantidad + 1)
                      }
                      className="p-2 text-stone-600 hover:bg-stone-100 disabled:opacity-40 cursor-pointer"
                      aria-label="Sumar cantidad"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>

                  <p className="min-w-24 text-right font-bold text-stone-900">
                    {formatPrecio(subtotal)}
                  </p>

                  <button
                    type="button"
                    onClick={() => quitar(item.producto_id)}
                    className="rounded-lg p-2 text-stone-400 hover:bg-red-50 hover:text-red-600 cursor-pointer"
                    aria-label="Quitar del carrito"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            );
          })}
        </div>

        <Card className="h-fit space-y-4 p-6">
          <h2 className="text-lg font-semibold text-stone-900">
            Resumen del pedido
          </h2>
          <div className="space-y-2 border-y border-stone-100 py-4 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Productos ({items.reduce((a, i) => a + i.cantidad, 0)})</span>
              <span>{formatPrecio(total)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Envío</span>
              <span className="font-medium text-emerald-700">Sin cargo</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-lg font-bold text-stone-900">
            <span>Total</span>
            <span className="text-orange-700">{formatPrecio(total)}</span>
          </div>

          <Link to="/checkout" className="block">
            <Button size="lg" className="w-full">
              {usuario ? 'Continuar al checkout' : 'Iniciar sesión para pedir'}
            </Button>
          </Link>
          <Link to="/" className="block text-center text-sm font-medium text-stone-600 hover:text-orange-600">
            Seguir agregando productos
          </Link>
        </Card>
      </div>
    </div>
  );
}
