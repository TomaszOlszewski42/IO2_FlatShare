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

  return 'Nie udało się wysłać zgłoszenia. Spróbuj ponownie później.'
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
      nextErrors.reason = 'Wybierz powód zgłoszenia.'
    }

    if (details.length > detailsMaxLength) {
      nextErrors.details = `Opis może mieć maksymalnie ${detailsMaxLength} znaków.`
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
            Zgłoś naruszenie
          </h2>

          <p class="text-sm text-base-content/70">
            Zgłoszenie zostanie przekazane do moderacji. Opisz problem możliwie konkretnie, aby
            administrator mógł szybciej ocenić sytuację.
          </p>

          {targetLabel ? (
            <p class="rounded-box bg-base-200/60 px-3 py-2 text-sm text-base-content/80">
              Dotyczy: <span class="font-medium">{targetLabel}</span>
            </p>
          ) : null}
        </div>

        <form class="mt-6 flex flex-col gap-4" onSubmit={handleSubmit}>
          <FormErrorSummary error={submitError} />

          <SelectInput
            id="report-violation-reason"
            name="reason"
            label="Powód zgłoszenia"
            value={reason}
            options={reasonOptions}
            placeholder="Wybierz powód"
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
            label="Szczegóły"
            value={details}
            rows={5}
            placeholder="Dodaj opis sytuacji, linki, fragment treści albo inne informacje pomocne dla moderacji."
            disabled={isSubmitting}
            error={errors.details}
            onInput={(event) => {
              const target = event.currentTarget as HTMLTextAreaElement
              setDetails(target.value)
              setErrors((currentErrors) => ({ ...currentErrors, details: undefined }))
            }}
          />

          <div class="flex items-center justify-between gap-3 text-sm text-base-content/60">
            <span>Opis jest opcjonalny.</span>
            <span>
              {details.length}/{detailsMaxLength}
            </span>
          </div>

          <div class="mt-2 flex justify-end gap-3">
            <AppButton type="button" variant="ghost" disabled={isSubmitting} onClick={onClose}>
              Anuluj
            </AppButton>

            <AppButton type="submit" loading={isSubmitting}>
              Wyślij zgłoszenie
            </AppButton>
          </div>
        </form>
      </div>
    </div>
  )
}