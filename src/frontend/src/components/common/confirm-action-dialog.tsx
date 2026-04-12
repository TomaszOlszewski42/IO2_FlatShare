import { AppButton } from '../ui/app-button'

type ConfirmActionDialogProps = {
  isOpen: boolean
  title: string
  message: string
  confirmLabel: string
  cancelLabel?: string
  isLoading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmActionDialog({
  isOpen,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmActionDialogProps) {
  if (!isOpen) {
    return null
  }

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-dialog-title"
    >
      <div class="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl">
        <div class="space-y-2">
          <h2 id="confirm-action-dialog-title" class="text-xl font-semibold">
            {title}
          </h2>
          <p class="text-sm text-base-content/70">{message}</p>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <AppButton
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={onCancel}
          >
            {cancelLabel}
          </AppButton>

          <AppButton
            type="button"
            loading={isLoading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </AppButton>
        </div>
      </div>
    </div>
  )
}