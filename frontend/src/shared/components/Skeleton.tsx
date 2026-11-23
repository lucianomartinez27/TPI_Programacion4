interface SkeletonProps {
  variant?: 'cards' | 'list' | 'stats' | 'detail';
  count?: number;
}

export function Skeleton({ variant = 'list', count = 3 }: SkeletonProps) {
  if (variant === 'cards') {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando productos"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse"
          >
            <div className="aspect-video bg-gray-200 rounded-lg mb-4" />
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
              <div className="h-6 bg-gray-200 rounded w-16" />
              <div className="h-9 bg-gray-200 rounded w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'stats') {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando indicadores"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
          >
            <div className="h-10 w-10 bg-gray-200 rounded-lg mb-3" />
            <div className="h-6 bg-gray-200 rounded w-20 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-32" />
          </div>
        ))}
      </div>
    );
  }

  if (variant === 'detail') {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando detalle"
        className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse space-y-4"
      >
        <div className="h-7 bg-gray-200 rounded w-1/3" />
        <div className="h-4 bg-gray-200 rounded w-1/2" />
        <div className="h-40 bg-gray-200 rounded" />
      </div>
    );
  }

  return (
    <div aria-busy="true" aria-label="Cargando listado" className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse"
        >
          <div className="flex justify-between">
            <div className="h-5 bg-gray-200 rounded w-40" />
            <div className="h-5 bg-gray-200 rounded w-20" />
          </div>
          <div className="h-4 bg-gray-200 rounded w-56 mt-3" />
        </div>
      ))}
    </div>
  );
}
