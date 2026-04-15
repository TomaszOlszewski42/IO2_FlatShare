import { EmptyStateContent } from '../common/empty-state-content'
import { ClearFiltersButton, CreateListingButton } from './listings-action-buttons'
import { ListingsSurface } from './listings-surface'
import { RoleBoundary } from '../auth/role-boundary'
import { UserRole } from '../../types/user'

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
      <div class="card-body items-center py-10 text-center">
        <h2 class="text-xl font-semibold">Brak ogłoszeń do wyświetlenia</h2>
        
        <RoleBoundary 
          requiredRole={UserRole.Landlord}
          fallback={
            <p class="max-w-lg text-sm text-base-content/65">
              {hasFilters
                ? 'Zmień filtry lub frazę wyszukiwania, aby zobaczyć więcej wyników.'
                : 'Currently there are no active listings available. Check back later!'}
            </p>
          }
        >
          <p class="max-w-lg text-sm text-base-content/65">
            {hasFilters
              ? 'Zmień filtry lub frazę wyszukiwania, aby zobaczyć więcej wyników.'
              : 'Kiedy dodasz pierwsze ogłoszenie, pojawi się ono tutaj razem ze statusem i kluczowymi metadanami.'}
          </p>
        </RoleBoundary>

        <div class="mt-4 flex flex-wrap justify-center gap-2">
          {hasFilters ? <ClearFiltersButton onClick={onClearFilters} /> : null}
          
          <RoleBoundary requiredRole={UserRole.Landlord}>
            <CreateListingButton text="Dodaj pierwsze ogłoszenie" onClick={onCreateListing} />
          </RoleBoundary>
        </div>
      </div>
    </ListingsSurface>
  )
}