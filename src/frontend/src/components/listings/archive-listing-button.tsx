import { useState } from 'preact/hooks'
import { AppButton } from '../ui/app-button'
import { ConfirmActionDialog } from '../common/confirm-action-dialog'
import { archiveListing } from '../../services/listings-api'
import { readAuthSession } from '../../services/auth-session'

type ArchiveListingButtonProps = {
  listingId: string
  disabled?: boolean
  onSuccess?: () => void | Promise<void>
}

export function ArchiveListingButton(props: ArchiveListingButtonProps) {
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
      await archiveListing(props.listingId, session.token, session.type)
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
        variant="ghost"
        disabled={props.disabled || isSubmitting}
        onClick={openDialog}
      >
        Archive listing
      </AppButton>

      <ConfirmActionDialog
        isOpen={isDialogOpen}
        title="Archive listing"
        message="Are you sure you want to archive this listing? Archived listings are treated as closed and no longer active."
        confirmLabel="Archive"
        isLoading={isSubmitting}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </>
  )
}