import { route } from 'preact-router'

import { PasswordResetNewPasswordField } from './password-reset-new-password-field'
import { PasswordResetSuccessMessage } from './password-reset-success-message'
import { PasswordResetTokenField } from './password-reset-token-field'
import { FormErrorSummary } from '../forms/form-error-summary'

type PasswordResetConfirmFormProps = {
  resetToken: string
  newPassword: string
  isSubmitting?: boolean
  errorMessage?: string | null
  successMessage?: string | null
  fieldErrors: Record<string, string[]>
  onResetTokenInput: (event: Event) => void
  onNewPasswordInput: (event: Event) => void
  onSubmit: (event: Event) => void
}

export function PasswordResetConfirmForm({
  resetToken,
  newPassword,
  isSubmitting = false,
  errorMessage = null,
  successMessage = null,
  fieldErrors,
  onResetTokenInput,
  onNewPasswordInput,
  onSubmit,
}: PasswordResetConfirmFormProps) {
  return (
    <form class="space-y-6" onSubmit={onSubmit}>
      <PasswordResetTokenField
        value={resetToken}
        disabled={isSubmitting}
        errors={fieldErrors.resetToken}
        onInput={onResetTokenInput}
      />

      <PasswordResetNewPasswordField
        value={newPassword}
        disabled={isSubmitting}
        errors={fieldErrors.newPassword}
        onInput={onNewPasswordInput}
      />

      <FormErrorSummary error={errorMessage} />
      <PasswordResetSuccessMessage message={successMessage} />

      <div class="flex gap-3">
        <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Reset password'}
        </button>

        <button class="btn btn-ghost" type="button" onClick={() => route('/login')}>
          Back to login
        </button>
      </div>
    </form>
  )
}