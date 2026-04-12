import { useState } from 'preact/hooks'
import { route } from 'preact-router'

import { FormErrorSummary } from '../components/forms/form-error-summary'
import { TextInput } from '../components/ui/text-input'
import { confirmPasswordReset } from '../services/password-reset-api'
import { mapFormErrors } from '../services/form-error-mapper'

export function PasswordResetConfirmPage(_props: { path?: string }) {
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({})

  async function handleSubmit(event: Event) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setFieldErrors({})
    setIsSubmitting(true)

    try {
      const response = await confirmPasswordReset({ resetToken, newPassword })
      setSuccessMessage(response.message || 'Password has been reset successfully.')
    } catch (caughtError) {
      const mappedError = mapFormErrors(caughtError)
      setError(mappedError.summary ?? 'Request failed.')
      setFieldErrors(mappedError.fieldErrors)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div class="mx-auto max-w-md space-y-6">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold">Set new password</h1>
        <p class="text-sm opacity-80">Paste your reset token and choose a new password.</p>
      </div>

      <form class="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          id="resetToken"
          name="resetToken"
          label="Reset token"
          type="text"
          value={resetToken}
          required
          disabled={isSubmitting}
          onInput={(event) => setResetToken((event.currentTarget as HTMLInputElement).value)}
          errors={fieldErrors.resetToken}
        />

        <TextInput
          id="newPassword"
          name="newPassword"
          label="New password"
          type="password"
          value={newPassword}
          required
          disabled={isSubmitting}
          onInput={(event) => setNewPassword((event.currentTarget as HTMLInputElement).value)}
          errors={fieldErrors.newPassword}
        />

        <FormErrorSummary error={error} />
        {successMessage ? <div class="alert alert-success text-sm">{successMessage}</div> : null}

        <div class="flex gap-3">
          <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Reset password'}
          </button>

          <button class="btn btn-ghost" type="button" onClick={() => route('/login')}>
            Back to login
          </button>
        </div>
      </form>
    </div>
  )
}