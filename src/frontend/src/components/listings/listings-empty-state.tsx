import { ClearFiltersButton, CreateListingButton } from './listings-action-buttons'
import { ListingsSurface } from './listings-surface'

type ListingsEmptyStateProps = {
  hasFilters: boolean
  onClearFilters: () => void
  onCreateListing: () => void
}

export function ListingsEmptyState({ hasFilters, onClearFilters, onCreateListing }: ListingsEmptyStateProps) {
  return (
    <ListingsSurface dashed translucent>
      <div class="card-body items-center py-10 text-center">
        <h2 class="text-xl font-semibold">Brak ogłoszeń do wyświetlenia</h2>
        <p class="max-w-lg text-sm text-base-content/65">
          {hasFilters
            ? 'Zmień filtry lub frazę wyszukiwania, aby zobaczyć więcej wyników.'
            : 'Kiedy dodasz pierwsze ogłoszenie, pojawi się ono tutaj razem ze statusem i kluczowymi metadanymi.'}
        </p>

        <div class="mt-4 flex flex-wrap justify-center gap-2">
          {hasFilters ? <ClearFiltersButton onClick={onClearFilters} /> : null}
          <CreateListingButton text="Dodaj pierwsze ogłoszenie" onClick={onCreateListing} />
        </div>
      </div>
    </ListingsSurface>
  )
}
