// import type { RoutableProps } from 'preact-router'

// export function HomePage(_: RoutableProps) {
//   return (
//     <section class="flex w-full flex-1 items-center justify-center">
//       <div class="card w-full max-w-xl border border-base-300 bg-base-100/80 shadow-md">
//         <div class="card-body gap-4">
//           <h1 class="text-3xl font-bold">FlatShare</h1>
//           <p class="text-base-content/70">
//            Qui quidem dicta. Quibusdam rerum voluptas alias voluptatibus atque natus. Harum corrupti nemo dolores. Suscipit expedita quia molestiae tempore.
//           </p>
//         </div>
//       </div>
//     </section>
//   )
// }

import type { RoutableProps } from 'preact-router'
import { useState } from 'preact/hooks'

import { ListingOwnerActionsPanel } from '../components/listings/listing-owner-actions-panel'
import { TextInput } from '../components/ui/text-input'
import { SelectInput } from '../components/ui/select-input'
import { LISTING_STATUSES, type ListingStatus } from '../types/listing-status'
import { useAuth } from '../hooks/use-auth'
import { RoleBoundary } from '../components/auth/role-boundary'
import { UserRole } from '../types/user'

const statusOptions = LISTING_STATUSES.map((status) => ({
  value: status,
  label: status,
}))

export function HomePage(_: RoutableProps) {
  const { isLandlord, isAuthenticated } = useAuth()
  const [listingId, setListingId] = useState('')
  const [status, setStatus] = useState<ListingStatus>('ACTIVE')

  if (!isAuthenticated) {
    return (
      <section class="flex w-full flex-1 items-center justify-center">
        <div class="card w-full max-w-xl border border-base-300 bg-base-100/80 shadow-md">
          <div class="card-body gap-4 text-center">
            <h1 class="text-4xl font-bold tracking-tight">Welcome to FlatShare</h1>
            <p class="text-lg text-base-content/70">
              Find your next home or manage your properties with ease.
            </p>
            <div class="card-actions justify-center mt-4">
              <a href="/login" class="btn btn-primary">Get Started</a>
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section class="flex w-full flex-1 justify-center">
      <div class="flex w-full max-w-3xl flex-col gap-6">
        <div class="card border border-base-300 bg-base-100/80 shadow-md">
          <div class="card-body gap-4">
            <h1 class="text-3xl font-bold">
              {isLandlord ? 'Landlord Dashboard' : 'Welcome back!'}
            </h1>
            <p class="text-base-content/70">
              {isLandlord 
                ? 'Manage your listings and interact with potential tenants.' 
                : 'Browse available listings and find your perfect flat.'}
            </p>
          </div>
        </div>

        <RoleBoundary requiredRole={UserRole.Landlord}>
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body gap-4">
              <h2 class="text-xl font-semibold">Owner actions test panel</h2>

              <TextInput
                id="listingId"
                name="listingId"
                label="Listing ID"
                value={listingId}
                placeholder="Enter listing id"
                onInput={(event) => {
                  setListingId(event.currentTarget.value)
                }}
              />

              <SelectInput
                id="listingStatus"
                name="listingStatus"
                label="Listing status"
                value={status}
                options={statusOptions}
                onChange={(event) => {
                  const target = event.currentTarget as HTMLSelectElement
                  setStatus(target.value as ListingStatus)
                }}
              />

              <ListingOwnerActionsPanel
                listingId={listingId}
                status={status}
                onActionSuccess={() => {
                  window.location.reload()
                }}
              />
            </div>
          </div>
        </RoleBoundary>

        <RoleBoundary requiredRole={UserRole.Tenant}>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="card border border-base-300 bg-base-100 shadow-sm">
              <div class="card-body">
                <h2 class="card-title">Find a Flat</h2>
                <p>Browse all active listings and find a place that suits your needs.</p>
                <div class="card-actions justify-end mt-4">
                  <a href="/listings" class="btn btn-outline btn-sm">Browse Listings</a>
                </div>
              </div>
            </div>
          </div>
        </RoleBoundary>
      </div>
    </section>
  )
}