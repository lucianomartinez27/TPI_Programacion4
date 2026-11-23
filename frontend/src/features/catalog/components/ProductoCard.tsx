import { Link } from 'react-router-dom';
import type { ProductoRead } from '@/shared/api/types';
import { useCartStore } from '@/store/cartStore';
import { Button } from '@/shared/ui/Button';
import { Card } from '@/shared/ui/Card';

interface ProductoCardProps {
  producto: ProductoRead;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const agregarItem = useCartStore((s) => s.agregarItem);

  const handleAdd = () => {
    agregarItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio_base: producto.precio_base,
      imagen_url: producto.imagen_url,
    });
  };

  return (
    <Card className="flex flex-col">
      <Link
        to={`/productos/${producto.id}`}
        className="block aspect-video bg-gray-100 rounded-lg mb-4 overflow-hidden flex items-center justify-center group"
      >
        {producto.imagen_url ? (
          <img
            src={producto.imagen_url}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <svg className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        )}
      </Link>
      <div className="flex-1">
        {producto.categoria && (
          <span className="text-xs text-gray-500">{producto.categoria.nombre}</span>
        )}
        <Link to={`/productos/${producto.id}`} className="block hover:text-brand transition-colors">
          <h3 className="font-semibold text-gray-900 mt-1">{producto.nombre}</h3>
        </Link>
        {producto.descripcion && (
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{producto.descripcion}</p>
        )}
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
        <span className="text-lg font-bold text-brand">
          ${producto.precio_base.toFixed(2)}
        </span>
        <Button
          size="sm"
          onClick={handleAdd}
          disabled={!producto.disponible || producto.stock === 0}
        >
          {producto.stock === 0 ? 'Agotado' : 'Agregar'}
        </Button>
      </div>
    </Card>
  );
}
