import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useCategorias } from '@/features/categorias/hooks/useCategorias';
import { useProductos } from '@/features/productos';
import { ProductoCard } from '@/features/productos';
import { Paginacion } from '@/shared/components/Paginacion';
import { CatalogoSkeleton } from '@/shared/components/Skeleton';
import { EstadoVacio } from '@/shared/components/EstadoVacio';
import { EstadoError } from '@/shared/components/EstadoError';
import { handleApiError } from '@/shared/api/handleApiError';
import { Button } from '@/shared/ui/Button';

const ITEMS_POR_PAGINA = 6;

export function CatalogoPage() {
  const [pagina, setPagina] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [searchAplicado, setSearchAplicado] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | undefined>(undefined);

  const categoriasQuery = useCategorias();
  const productosQuery = useProductos({
    skip: pagina * ITEMS_POR_PAGINA,
    limit: ITEMS_POR_PAGINA,
    search: searchAplicado || undefined,
    categoria_id: categoriaId,
  });

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    setPagina(0);
    setSearchAplicado(searchInput.trim());
  };

  const handleLimpiarFiltros = () => {
    setSearchInput('');
    setSearchAplicado('');
    setCategoriaId(undefined);
    setPagina(0);
  };

  const handleSeleccionCategoria = (id: number | undefined) => {
    setCategoriaId(id);
    setPagina(0);
  };

  const hayFiltrosActivos =
    Boolean(searchAplicado) || categoriaId !== undefined;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 px-6 py-8 text-white shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Pedí tu comida favorita al instante
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-orange-50 sm:text-base">
          Hamburguesas artesanales, pizzas a la piedra, empanadas caseras y
          bebidas bien frías. Armá tu carrito y recibí tu pedido en casa.
        </p>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-stone-200 bg-white p-4 shadow-xs">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <form
            onSubmit={handleBuscar}
            className="flex flex-1 items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400" />
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Buscar por nombre (ej. pizza, hamburguesa)..."
                className="w-full rounded-lg border border-stone-300 py-2 pl-9 pr-3 text-sm text-stone-900 placeholder:text-stone-400 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200"
              />
            </div>
            <Button type="submit" size="md">
              Buscar
            </Button>
          </form>

          {hayFiltrosActivos && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLimpiarFiltros}
              className="self-start md:self-auto"
            >
              <X className="h-4 w-4" />
              Limpiar filtros
            </Button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Categorías:
          </span>
          <button
            type="button"
            onClick={() => handleSeleccionCategoria(undefined)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
              categoriaId === undefined
                ? 'bg-orange-600 text-white'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas
          </button>
          {categoriasQuery.data?.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => handleSeleccionCategoria(cat.id)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                categoriaId === cat.id
                  ? 'bg-orange-600 text-white'
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat.nombre}
            </button>
          ))}
        </div>
      </section>

      {productosQuery.isPending ? (
        <CatalogoSkeleton count={ITEMS_POR_PAGINA} />
      ) : productosQuery.isError ? (
        <EstadoError
          mensaje={handleApiError(productosQuery.error)}
          onReintentar={() => void productosQuery.refetch()}
        />
      ) : productosQuery.data.items.length === 0 ? (
        <EstadoVacio
          titulo="No encontramos productos"
          descripcion={
            hayFiltrosActivos
              ? 'Probá con otra palabra clave o quitá el filtro de categoría.'
              : 'Aún no hay productos cargados en el catálogo.'
          }
          accion={
            hayFiltrosActivos ? (
              <Button variant="secondary" onClick={handleLimpiarFiltros}>
                Ver todo el catálogo
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {productosQuery.data.items.map((producto) => (
              <ProductoCard key={producto.id} producto={producto} />
            ))}
          </div>

          <Paginacion
            paginaActual={pagina}
            totalItems={productosQuery.data.total}
            porPagina={ITEMS_POR_PAGINA}
            onCambiarPagina={setPagina}
          />
        </>
      )}
    </div>
  );
}
