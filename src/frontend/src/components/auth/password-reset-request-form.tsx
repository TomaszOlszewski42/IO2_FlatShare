import { route } from 'preact-router'

import { PasswordResetEmailField } from './password-reset-email-field'
import { PasswordResetSuccessMessage } from './password-reset-success-message'
import { FormErrorSummary } from '../forms/form-error-summary'

type PasswordResetRequestFormProps = {
  email: string
  isSubmitting?: boolean
  errorMessage?: string | null
  successMessage?: string | null
  fieldErrors: Record<string, string[]>
  onEmailInput: (event: Event) => void
  onSubmit: (event: Event) => void
}

export function PasswordResetRequestForm({
  email,
  isSubmitting = false,
  errorMessage = null,
  successMessage = null,
  fieldErrors,
  onEmailInput,
  onSubmit,
}: PasswordResetRequestFormProps) {
  return (
    <form class="space-y-6" onSubmit={onSubmit}>
      <PasswordResetEmailField
        value={email}
        disabled={isSubmitting}
        errors={fieldErrors.email}
        onInput={onEmailInput}
      />

      <FormErrorSummary error={errorMessage} />
      <PasswordResetSuccessMessage message={successMessage} />

      <div class="flex gap-3">
        <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send reset instructions'}
        </button>

        <button class="btn btn-ghost" type="button" onClick={() => route('/login')}>
          Back to login
        </button>
      </div>
    </form>
  )
}