import { useState } from 'preact/hooks'
import { ConfirmActionDialog } from '../common/confirm-action-dialog'
import { AppButton } from '../ui/app-button'
import { readAuthSession } from '../../services/auth-session'

type ButtonVariant = 'primary' | 'outline' | 'ghost'

type ListingStatusAction = (
  listingId: string,
  token: string,
  type?: string,
) => Promise<unknown>

type ListingStatusActionButtonProps = {
  listingId: string
  disabled?: boolean
  onSuccess?: () => void | Promise<void>
  buttonLabel: string
  buttonVariant?: ButtonVariant
  dialogTitle: string
  dialogMessage: string
  confirmLabel: string
  action: ListingStatusAction
}

export function ListingStatusActionButton(props: ListingStatusActionButtonProps) {
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
      await props.action(props.listingId, session.token, session.type)
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
        variant={props.buttonVariant ?? 'primary'}
        disabled={props.disabled || isSubmitting}
        onClick={openDialog}
      >
        {props.buttonLabel}
      </AppButton>

      <ConfirmActionDialog
        isOpen={isDialogOpen}
        title={props.dialogTitle}
        message={props.dialogMessage}
        confirmLabel={props.confirmLabel}
        isLoading={isSubmitting}
        onCancel={closeDialog}
        onConfirm={handleConfirm}
      />
    </>
  )
}