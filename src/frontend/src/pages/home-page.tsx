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

const statusOptions = LISTING_STATUSES.map((status) => ({
  value: status,
  label: status,
}))

export function HomePage(_: RoutableProps) {
  const [listingId, setListingId] = useState('')
  const [status, setStatus] = useState<ListingStatus>('ACTIVE')

  return (
    <section class="flex w-full flex-1 justify-center">
      <div class="flex w-full max-w-3xl flex-col gap-6">
        <div class="card border border-base-300 bg-base-100/80 shadow-md">
          <div class="card-body gap-4">
            <h1 class="text-3xl font-bold">FlatShare</h1>
            <p class="text-base-content/70">
              Temporary integration area for owner listing actions.
            </p>
          </div>
        </div>

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
      </div>
    </section>
  )
}