import { archiveListing } from '../../services/listings-api'
import { ListingStatusActionButton } from './listing-status-action-button'

type ArchiveListingButtonProps = {
  listingId: string
  disabled?: boolean
  onSuccess?: () => void | Promise<void>
}

export function ArchiveListingButton(props: ArchiveListingButtonProps) {
  return (
    <ListingStatusActionButton
      listingId={props.listingId}
      disabled={props.disabled}
      onSuccess={props.onSuccess}
      buttonLabel="Archive listing"
      buttonVariant="ghost"
      dialogTitle="Archive listing"
      dialogMessage="Are you sure you want to archive this listing? Archived listings are treated as closed and no longer active."
      confirmLabel="Archive"
      action={archiveListing}
    />
  )
}