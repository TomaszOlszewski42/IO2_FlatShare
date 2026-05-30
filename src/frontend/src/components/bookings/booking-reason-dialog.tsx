import type { JSX } from 'preact'
import { useState } from 'preact/hooks'
import { AppButton } from '../ui/app-button'
import { TextArea } from '../ui/text-area'

type BookingReasonDialogProps = {
  isOpen: boolean
  action: 'cancel' | 'reject'
  isLoading?: boolean
  onConfirm: (reason: string) => void
  onCancel: () => void
}

export function BookingReasonDialog({
  isOpen,
  action,
  isLoading = false,
  onConfirm,
  onCancel,
}: BookingReasonDialogProps) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | undefined>(undefined)

  const actionLabel = action === 'cancel' ? 'Cancel booking' : 'Reject booking'
  const actionPrompt =
    action === 'cancel'
      ? 'Please provide a reason for cancelling this booking.'
      : 'Please provide a reason for rejecting this booking request.'

  function handleConfirm() {
    const trimmedReason = reason.trim()

    if (!trimmedReason) {
      setError('Reason is required.')
      return
    }

    if (trimmedReason.length < 3) {
      setError('Reason must be at least 3 characters.')
      return
    }

    setReason('')
    setError(undefined)
    onConfirm(trimmedReason)
  }

  function handleCancel() {
    setReason('')
    setError(undefined)
    onCancel()
  }

  function handleInputChange(event: JSX.TargetedEvent<HTMLTextAreaElement>) {
    const target = event.currentTarget as HTMLTextAreaElement
    setReason(target.value)
    setError(undefined)
  }

  if (!isOpen) {
    return null
  }

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="booking-reason-dialog-title"
    >
      <div class="w-full max-w-md rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl">
        <div class="space-y-2">
          <h2 id="booking-reason-dialog-title" class="text-xl font-semibold">
            {actionLabel}
          </h2>
          <p class="text-sm text-base-content/70">{actionPrompt}</p>
        </div>

        <div class="mt-4 space-y-3">
          <TextArea
            id="booking-reason-input"
            name="reason"
            label="Reason"
            placeholder="Enter reason..."
            value={reason}
            disabled={isLoading}
            error={error}
            onInput={handleInputChange}
          />
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <AppButton
            type="button"
            variant="ghost"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancel
          </AppButton>

          <AppButton type="button" loading={isLoading} onClick={handleConfirm}>
            {actionLabel}
          </AppButton>
        </div>
      </div>
    </div>
  )
}
