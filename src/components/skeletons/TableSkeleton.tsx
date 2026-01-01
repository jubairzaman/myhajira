import { Skeleton } from '@/components/ui/skeleton';

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 6 }: TableSkeletonProps) {
  return (
    <div className="card-elevated overflow-hidden">
      {/* Header skeleton */}
      <div className="border-b border-border p-4">
        <div className="flex gap-4">
          {[...Array(columns)].map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      </div>
      
      {/* Rows skeleton */}
      <div className="divide-y divide-border">
        {[...Array(rows)].map((_, rowIndex) => (
          <div key={rowIndex} className="p-4 flex gap-4 items-center">
            {[...Array(columns)].map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                className={`h-4 flex-1 ${colIndex === 0 ? 'w-10 h-10 rounded-full flex-none' : ''}`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function CardGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="card-elevated p-6">
          <div className="flex items-start justify-between mb-4">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="w-8 h-8 rounded" />
          </div>
          <Skeleton className="h-5 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
