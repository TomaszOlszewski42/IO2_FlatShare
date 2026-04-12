type ListingsSkeletonProps = {
  count?: number
}

export function ListingsSkeleton({ count = 4 }: ListingsSkeletonProps) {
  return (
    <div class="grid gap-4 md:grid-cols-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body gap-3">
            <div class="skeleton h-5 w-2/3" />
            <div class="skeleton h-4 w-1/2" />
            <div class="skeleton h-28 w-full" />
            <div class="skeleton h-4 w-1/3" />
          </div>
        </div>
      ))}
    </div>
  )
}
