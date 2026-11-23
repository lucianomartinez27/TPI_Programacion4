import { useState } from 'react';
import { ShoppingBag, UtensilsCrossed } from 'lucide-react';
import type { Producto } from '../types/producto.types';
import { useCartStore } from '@/store/cartStore';
import { useNotificationStore } from '@/store/notificationStore';
import { formatPrecio } from '@/shared/utils/formatters';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregar = useCartStore((s) => s.agregar);
  const items = useCartStore((s) => s.items);
  const showNotification = useNotificationStore((s) => s.showNotification);
  const [imgError, setImgError] = useState(false);

  const enCarrito =
    items.find((i) => i.producto_id === producto.id)?.cantidad ?? 0;
  const sinStock = !producto.disponible || producto.stock <= 0;
  const limiteAlcanzado = enCarrito >= producto.stock;

  const handleAgregar = () => {
    if (sinStock || limiteAlcanzado) return;
    agregar(
      {
        producto_id: producto.id,
        nombre: producto.nombre,
        precio_unitario: producto.precio_base,
        imagen_url: producto.imagen_url,
        stock_disponible: producto.stock,
      },
      1,
    );
    showNotification(`Se agregó "${producto.nombre}" al carrito.`, 'success');
  };

  return (
    <Card className="flex h-full flex-col overflow-hidden transition-shadow hover:shadow-md">
      <div className="relative h-48 w-full bg-stone-100">
        {producto.imagen_url && !imgError ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="h-full w-full object-cover"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-stone-400">
            <UtensilsCrossed className="h-12 w-12" />
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-stone-800 shadow-xs">
          {producto.categoria.nombre}
        </span>
        {sinStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-stone-900/55">
            <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              {!producto.disponible ? 'No disponible' : 'Sin stock'}
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="text-base font-semibold text-stone-900 line-clamp-1">
          {producto.nombre}
        </h3>
        <p className="mt-1 flex-1 text-sm text-stone-500 line-clamp-2">
          {producto.descripcion || 'Preparado fresco al momento.'}
        </p>

        <div className="mt-4 flex items-end justify-between gap-2 border-t border-stone-100 pt-3">
          <div>
            <p className="text-lg font-bold text-stone-900">
              {formatPrecio(producto.precio_base)}
            </p>
            <p className="text-xs text-stone-500">
              {producto.disponible
                ? `Stock: ${producto.stock} u.`
                : 'Temporalmente pausado'}
            </p>
          </div>

          <Button
            size="sm"
            disabled={sinStock || limiteAlcanzado}
            onClick={handleAgregar}
          >
            <ShoppingBag className="h-4 w-4" />
            {limiteAlcanzado && !sinStock
              ? `En carrito (${enCarrito})`
              : 'Agregar al carrito'}
          </Button>
        </div>
      </div>
    </Card>
  );
}
