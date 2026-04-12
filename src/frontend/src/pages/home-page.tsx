import type { RoutableProps } from 'preact-router'

export function HomePage(_: RoutableProps) {
  return (
    <section class="flex w-full flex-1 items-center justify-center">
      <div class="card w-full max-w-xl border border-base-300 bg-base-100/80 shadow-md">
        <div class="card-body gap-4">
          <h1 class="text-3xl font-bold">FlatShare</h1>
          <p class="text-base-content/70">
           Qui quidem dicta. Quibusdam rerum voluptas alias voluptatibus atque natus. Harum corrupti nemo dolores. Suscipit expedita quia molestiae tempore.
          </p>
        </div>
      </div>
    </section>
  )
}