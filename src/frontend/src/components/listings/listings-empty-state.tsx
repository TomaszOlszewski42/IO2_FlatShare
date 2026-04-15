import { EmptyStateContent } from '../common/empty-state-content'
import { ClearFiltersButton, CreateListingButton } from './listings-action-buttons'
import { ListingsSurface } from './listings-surface'

type ListingsEmptyStateProps = {
  hasFilters: boolean
  onClearFilters: () => void
  onCreateListing: () => void
}

export function ListingsEmptyState({
  hasFilters,
  onClearFilters,
  onCreateListing,
}: ListingsEmptyStateProps) {
  return (
    <ListingsSurface dashed translucent>
      <div class="card-body py-10">
        <EmptyStateContent
          title="Brak ogłoszeń do wyświetlenia"
          description={
            hasFilters
              ? 'Zmień filtry lub frazę wyszukiwania, aby zobaczyć więcej wyników.'
              : 'Kiedy dodasz pierwsze ogłoszenie, pojawi się ono tutaj razem ze statusem i kluczowymi metadanymi.'
          }
        >
          {hasFilters ? <ClearFiltersButton onClick={onClearFilters} /> : null}
          <CreateListingButton text="Dodaj pierwsze ogłoszenie" onClick={onCreateListing} />
        </EmptyStateContent>
      </div>
    </ListingsSurface>
  )
}