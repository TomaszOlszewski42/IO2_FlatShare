import { HideListingButton } from './hide-listing-button'
import { ArchiveListingButton } from './archive-listing-button'
import type { ListingStatus } from '../../types/listing-status'

type ListingOwnerActionsPanelProps = {
  listingId: string
  status?: ListingStatus
  isBusy?: boolean
  onActionSuccess?: () => void | Promise<void>
}

function canHide(status?: ListingStatus): boolean {
  return status === 'ACTIVE'
}

function canArchive(status?: ListingStatus): boolean {
  return status === 'ACTIVE' || status === 'HIDDEN'
}

export function ListingOwnerActionsPanel(props: ListingOwnerActionsPanelProps) {
  const hideDisabled = props.isBusy || !canHide(props.status)
  const archiveDisabled = props.isBusy || !canArchive(props.status)

  return (
    <section class="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
      <div class="mb-4">
        <h2 class="text-lg font-semibold">Owner actions</h2>
        <p class="mt-1 text-sm text-base-content/70">
          Manage the visibility and lifecycle of this listing.
        </p>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <HideListingButton
          listingId={props.listingId}
          disabled={hideDisabled}
          onSuccess={props.onActionSuccess}
        />

        <ArchiveListingButton
          listingId={props.listingId}
          disabled={archiveDisabled}
          onSuccess={props.onActionSuccess}
        />
      </div>

      {props.status && (
        <p class="mt-4 text-xs text-base-content/60">
          Current status: <span class="font-medium">{props.status}</span>
        </p>
      )}
    </section>
  )
}