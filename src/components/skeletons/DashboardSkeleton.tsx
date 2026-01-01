import { Skeleton } from '@/components/ui/skeleton';

export function StatCardSkeleton() {
  return (
    <div className="card-elevated p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-6 w-12" />
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {[...Array(6)].map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Quick Actions Skeleton */}
      <div className="card-elevated p-4">
        <Skeleton className="h-5 w-32 mb-4" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-lg" />
          ))}
        </div>
      </div>

      {/* Charts and Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2">
          <div className="card-elevated p-4">
            <Skeleton className="h-5 w-40 mb-4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
        </div>
        <div className="card-elevated p-4">
          <Skeleton className="h-5 w-32 mb-4" />
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
