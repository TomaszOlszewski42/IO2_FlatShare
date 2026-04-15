import type { ListingStatus } from '../../types/listing-status'
import { ArchiveListingButton } from './archive-listing-button'
import { HideListingButton } from './hide-listing-button'
import { ListingSection } from './listing-section'

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
    <ListingSection
      title="Owner actions"
      className="[&_.card-body]:gap-4"
    >
      <p class="text-sm text-base-content/70">
        Manage the visibility and lifecycle of this listing.
      </p>

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

      {props.status ? (
        <p class="text-xs text-base-content/60">
          Current status: <span class="font-medium">{props.status}</span>
        </p>
      ) : null}
    </ListingSection>
  )
}