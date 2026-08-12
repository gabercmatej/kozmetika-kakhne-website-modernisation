import { ProductCardSkeleton, Skeleton } from "@/components/ui/misc";

export default function LoadingProducts() {
  return (
    <div className="page-container pb-24 pt-8">
      <Skeleton className="h-4 w-40" />
      <Skeleton className="mt-6 h-11 w-72" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />

      <div className="mt-8 flex gap-2">
        {Array.from({ length: 5 }, (_, i) => (
          <Skeleton key={i} className="h-10 w-28" />
        ))}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)] lg:gap-12">
        <div className="hidden gap-6 lg:grid">
          {Array.from({ length: 3 }, (_, i) => (
            <div key={i} className="grid gap-2">
              <Skeleton className="h-3 w-24" />
              {Array.from({ length: 5 }, (_, j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </div>
          ))}
        </div>

        <div>
          <Skeleton className="h-10 w-full" />
          <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3">
            {Array.from({ length: 9 }, (_, i) => (
              <li key={i}>
                <ProductCardSkeleton />
              </li>
            ))}
          </ul>
        </div>
      </div>
      <span className="sr-only" role="status">
        Nalagam izdelke
      </span>
    </div>
  );
}
