import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ShoppingCart } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { Card } from '@/shared/ui/Card';
import { Button } from '@/shared/ui/Button';
import { EstadoError, Skeleton } from '@/shared/components';
import { useProducto } from '@/features/catalog/hooks/useCatalog';
import { useCartStore } from '@/store/cartStore';

export function ProductoDetailPage() {
  const { id } = useParams<{ id: string }>();
  const numericId = id ? Number(id) : Number.NaN;
  const isValidId = Number.isInteger(numericId) && numericId > 0;

  const { data: producto, isLoading, isError, error, refetch } = useProducto(
    isValidId ? numericId : 0,
  );
  const agregarItem = useCartStore((s) => s.agregarItem);

  if (!isValidId) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto space-y-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand">
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>
          <EstadoError message="El identificador del producto no es válido." />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-brand">
          <ArrowLeft className="h-4 w-4" />
          Volver al catálogo
        </Link>

        {isLoading ? (
          <Skeleton variant="detail" />
        ) : isError || !producto ? (
          <EstadoError error={error} onRetry={() => void refetch()} />
        ) : (
          <Card>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="aspect-video md:aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                {producto.imagen_url ? (
                  <img
                    src={producto.imagen_url}
                    alt={producto.nombre}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="h-16 w-16 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                )}
              </div>

              <div className="flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  {producto.categoria && (
                    <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-orange-50 text-brand">
                      {producto.categoria.nombre}
                    </span>
                  )}
                  <h1 className="text-3xl font-bold text-gray-900">{producto.nombre}</h1>
                  {producto.descripcion && (
                    <p className="text-gray-600 leading-relaxed">{producto.descripcion}</p>
                  )}
                  <p className="text-2xl font-bold text-brand">
                    ${producto.precio_base.toFixed(2)}
                  </p>
                  <p className="text-sm text-gray-500">
                    {producto.disponible && producto.stock > 0
                      ? `Stock disponible: ${producto.stock} unidad(es)`
                      : 'Sin stock disponible'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
                  <Button
                    size="lg"
                    disabled={!producto.disponible || producto.stock === 0}
                    onClick={() =>
                      agregarItem({
                        producto_id: producto.id,
                        nombre: producto.nombre,
                        precio_base: producto.precio_base,
                        imagen_url: producto.imagen_url,
                      })
                    }
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {producto.stock === 0 ? 'Agotado' : 'Agregar al carrito'}
                  </Button>
                  <Link
                    to="/carrito"
                    className="inline-flex items-center justify-center px-5 py-3 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Ver carrito
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}
