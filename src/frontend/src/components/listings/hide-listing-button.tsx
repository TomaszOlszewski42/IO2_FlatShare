import { hideListing } from '../../services/listings-api'
import { ListingStatusActionButton } from './listing-status-action-button'

type HideListingButtonProps = {
  listingId: string
  disabled?: boolean
  onSuccess?: () => void | Promise<void>
}

export function HideListingButton(props: HideListingButtonProps) {
  return (
    <ListingStatusActionButton
      listingId={props.listingId}
      disabled={props.disabled}
      onSuccess={props.onSuccess}
      buttonLabel="Hide listing"
      buttonVariant="outline"
      dialogTitle="Hide listing"
      dialogMessage="Are you sure you want to hide this listing? Hidden listings will no longer be visible to users."
      confirmLabel="Hide"
      action={hideListing}
    />
  )
}