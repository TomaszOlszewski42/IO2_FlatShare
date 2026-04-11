import { useState } from 'preact/hooks'
import { AppButton } from '../ui/app-button'
import { ConfirmActionDialog } from '../common/confirm-action-dialog'
import { hideListing } from '../../services/listings-api'
import { readAuthSession } from '../../services/auth-session'

type HideListingButtonProps = {
  listingId: string
  disabled?: boolean
  onSuccess?: () => void | Promise<void>
}

export function HideListingButton(props: HideListingButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const openDialog = () => setIsDialogOpen(true)

  const closeDialog = () => {
    if (!isSubmitting) {
      setIsDialogOpen(false)
    }
  }

  const handleConfirm = async () => {
    const session = readAuthSession()

    if (!session) {
      return
    }

    try {
      setIsSubmitting(true)
      await hideListing(props.listingId, session.token, session.type)
      setIsDialogOpen(false)
      await props.onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <AppButton
        type="button"
        variant="outline"
        disabled={props.disabled || isSubmitting}
        onClick={openDialog}
      >
        Hide listing
      </AppButton>

      <ConfirmActionDialog
        isOpen={isDialogOpen}
        title="Hide listing"
        message="Are you sure you want to hide this listing? Hidden listings will no longer be visible to users."
        confirmLabel="Hide"
        isLoading={isSubmitting}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </>
  )
}