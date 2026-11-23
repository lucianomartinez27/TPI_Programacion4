import { useEffect, useMemo, useRef, useState } from 'react';
import { Filter, Search } from 'lucide-react';
import { MainLayout } from '@/shared/layout/MainLayout';
import { useCategorias, useProductos } from '@/features/catalog/hooks/useCatalog';
import { ProductoCard } from '@/features/catalog/components/ProductoCard';
import { Input } from '@/shared/ui/Input';
import { EstadoError, EstadoVacio, Paginacion, Skeleton } from '@/shared/components';

const LIMIT = 12;

export function CatalogPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<number | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearch(value);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(0);
    }, 400);
  };

  const { data, isLoading, isError, error, refetch } = useProductos(
    page * LIMIT,
    LIMIT,
    debouncedSearch || undefined,
    selectedCategoria,
  );
  const { data: categorias } = useCategorias();

  const totalPages = useMemo(() => {
    if (!data) return 0;
    return Math.ceil(data.total / LIMIT);
  }, [data]);

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Catálogo</h1>
        <p className="text-gray-500 mt-1">Explorá nuestros productos y armá tu pedido</p>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <select
            aria-label="Filtrar por categoría"
            value={selectedCategoria ?? ''}
            onChange={(e) => {
              setSelectedCategoria(e.target.value ? Number(e.target.value) : undefined);
              setPage(0);
            }}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg text-sm focus-visible:outline-2 focus-visible:outline-brand appearance-none bg-white"
          >
            <option value="">Todas las categorías</option>
            {categorias?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nombre}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Orden recomendado: Loading -> Error -> Empty -> Datos */}
      {isLoading ? (
        <Skeleton variant="cards" count={LIMIT} />
      ) : isError ? (
        <EstadoError error={error} onRetry={() => void refetch()} />
      ) : !data || data.items.length === 0 ? (
        <EstadoVacio
          title="No se encontraron productos"
          description="Probá ajustando la búsqueda o seleccionando otra categoría."
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data.items.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>

          <Paginacion
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className="mt-8"
          />
        </>
      )}
    </MainLayout>
  );
}
