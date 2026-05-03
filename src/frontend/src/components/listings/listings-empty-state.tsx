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
        <h2 class="text-xl font-semibold">No listings to display</h2>
        
        <RoleBoundary 
          requiredRole={UserRole.Landlord}
          fallback={
            <p class="max-w-lg text-sm text-base-content/65">
              {hasFilters
                ? 'Change filters or search phrase to see more results.'
                : 'Currently there are no active listings available. Check back later!'}
            </p>
          }
        >
          <p class="max-w-lg text-sm text-base-content/65">
            {hasFilters
              ? 'Change filters or search phrase to see more results.'
              : 'When you add your first listing, it will appear here along with its status and key metadata.'}
          </p>
        </RoleBoundary>

        <div class="mt-4 flex flex-wrap justify-center gap-2">
          {hasFilters ? <ClearFiltersButton onClick={onClearFilters} /> : null}
          
          <RoleBoundary requiredRole={UserRole.Landlord}>
            <CreateListingButton text="Add your first listing" onClick={onCreateListing} />
          </RoleBoundary>
        </div>
      </div>
    </ListingsSurface>
  )
}