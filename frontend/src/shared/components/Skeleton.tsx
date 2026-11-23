interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className = 'h-4 w-full' }: SkeletonProps) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-stone-200 ${className}`}
      aria-hidden="true"
    />
  );
}

export function CatalogoSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="overflow-hidden rounded-xl border border-stone-200 bg-white shadow-xs"
        >
          <Skeleton className="h-48 w-full rounded-none" />
          <div className="space-y-3 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-9 w-32" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function TablaSkeleton({ filas = 5 }: { filas?: number }) {
  return (
    <div className="space-y-3 rounded-xl border border-stone-200 bg-white p-4">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: filas }).map((_, idx) => (
        <Skeleton key={idx} className="h-12 w-full" />
      ))}
    </div>
  );
}
