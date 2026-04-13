export function ListingDetailsSkeleton() {
  return (
    <section class="flex w-full flex-1 flex-col gap-4">
      <div class="skeleton h-10 w-40" />
      <div class="skeleton h-12 w-2/3" />
      <div class="skeleton h-6 w-32" />
      <div class="skeleton h-96 w-full" />
      <div class="grid gap-4 md:grid-cols-2">
        <div class="skeleton h-56 w-full" />
        <div class="skeleton h-56 w-full" />
      </div>
    </section>
  )
}
