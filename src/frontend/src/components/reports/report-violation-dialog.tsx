import type { JSX } from 'preact'
import { useEffect, useState } from 'preact/hooks'

import { FormErrorSummary } from '../forms/form-error-summary'
import { AppButton } from '../ui/app-button'
import { SelectInput } from '../ui/select-input'
import { TextArea } from '../ui/text-area'
import {
  violationReportReasons,
  type CreateViolationReportPayload,
  type ViolationReportTargetType,
} from '../../types/violation-report'

type ReportViolationDialogProps = {
  isOpen: boolean
  targetId: string
  targetType?: ViolationReportTargetType
  targetLabel?: string
  onClose: () => void
  onSubmit: (payload: CreateViolationReportPayload) => void | Promise<void>
}

type FormErrors = {
  reason?: string
  details?: string
}

const detailsMaxLength = 1000

const reasonOptions = violationReportReasons.map((reason) => ({
  value: reason,
  label: reason,
}))

function getErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'Failed to send report. Try again later.'
}

export function ReportViolationDialog({
  isOpen,
  targetId,
  targetType = 'LISTING',
  targetLabel,
  onClose,
  onSubmit,
}: ReportViolationDialogProps) {
  const [reason, setReason] = useState('')
  const [details, setDetails] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setDetails('')
      setErrors({})
      setSubmitError(null)
      setIsSubmitting(false)
    }
  }, [isOpen])

  if (!isOpen) {
    return null
  }

  function validateForm(): FormErrors {
    const nextErrors: FormErrors = {}

    if (!reason.trim()) {
      nextErrors.reason = 'Choose report reason.'
    }

    if (details.length > detailsMaxLength) {
      nextErrors.details = `Description can be a maximum of ${detailsMaxLength} characters.`
    }

    return nextErrors
  }

  async function handleSubmit(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm()
    setErrors(nextErrors)
    setSubmitError(null)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit({
        type: targetType,
        targetId,
        reason: reason.trim(),
        details: details.trim() || null,
      })

      setReason('')
      setDetails('')
      setErrors({})
      onClose()
    } catch (error) {
      setSubmitError(getErrorMessage(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleBackdropClick(event: JSX.TargetedMouseEvent<HTMLDivElement>) {
    if (event.currentTarget === event.target && !isSubmitting) {
      onClose()
    }
  }

  return (
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-violation-dialog-title"
      onClick={handleBackdropClick}
    >
      <div class="w-full max-w-lg rounded-2xl border border-base-300 bg-base-100 p-6 shadow-xl">
        <div class="space-y-2">
          <h2 id="report-violation-dialog-title" class="text-xl font-semibold">
            Report violation
          </h2>

          <p class="text-sm text-base-content/70">
            The report will be forwarded to moderation. Describe the problem as specifically as possible so that the
            administrator can assess the situation more quickly.
          </p>

          {targetLabel ? (
            <p class="rounded-box bg-base-200/60 px-3 py-2 text-sm text-base-content/80">
              Applies to: <span class="font-medium">{targetLabel}</span>
            </p>
          ) : null}
        </div>

        <form class="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormErrorSummary error={submitError} />

          <SelectInput
            id="report-violation-reason"
            name="reason"
            label="Report reason"
            value={reason}
            options={reasonOptions}
            placeholder="Choose reason"
            required
            disabled={isSubmitting}
            error={errors.reason}
            onChange={(event) => {
              const target = event.currentTarget as HTMLSelectElement
              setReason(target.value)
              setErrors((currentErrors) => ({ ...currentErrors, reason: undefined }))
            }}
          />

          <TextArea
            id="report-violation-details"
            name="details"
            label="Details"
            value={details}
            rows={5}
            placeholder="Add a description of the situation, links, content fragments, or other information helpful for moderation."
            disabled={isSubmitting}
            error={errors.details}
            onInput={(event) => {
              const target = event.currentTarget as HTMLTextAreaElement
              setDetails(target.value)
              setErrors((currentErrors) => ({ ...currentErrors, details: undefined }))
            }}
          />

          <div class="flex items-center justify-between gap-3 text-sm text-base-content/60">
            <span>Description is optional.</span>
            <span>
              {details.length}/{detailsMaxLength}
            </span>
          </div>

          <div class="mt-2 flex justify-end gap-3">
            <AppButton type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
              Cancel
            </AppButton>

            <AppButton type="submit" loading={isSubmitting}>
              Send report
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  )
}