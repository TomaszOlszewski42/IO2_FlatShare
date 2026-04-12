import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { confirmPasswordReset } from '../services/password-reset-api'
import { ApiHttpError } from '../services/api-client'

export function PasswordResetConfirmPage(_props: { path?: string }) {
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: Event) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await confirmPasswordReset({ resetToken, newPassword })
      setSuccessMessage(response.message || 'Password has been reset successfully.')
    } catch (caughtError) {
      if (caughtError instanceof ApiHttpError) {
          setError(caughtError.message || 'Request failed.')
      } else {
        setError('Unexpected error occurred.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div class="mx-auto max-w-md space-y-6">
      <div class="space-y-2">
        <h1 class="text-2xl font-semibold">Set new password</h1>
        <p class="text-sm opacity-80">
          Paste your reset token and choose a new password.
        </p>
      </div>

      <form class="space-y-4" onSubmit={handleSubmit}>
        <div class="form-control">
          <label class="label" for="resetToken">
            <span class="label-text">Reset token</span>
          </label>
          <input
            id="resetToken"
            type="text"
            class="input input-bordered w-full"
            value={resetToken}
            onInput={(event) => setResetToken((event.currentTarget as HTMLInputElement).value)}
            required
          />
        </div>

        <div class="form-control">
          <label class="label" for="newPassword">
            <span class="label-text">New password</span>
          </label>
          <input
            id="newPassword"
            type="password"
            class="input input-bordered w-full"
            value={newPassword}
            onInput={(event) => setNewPassword((event.currentTarget as HTMLInputElement).value)}
            required
          />
        </div>

        {error ? <div class="alert alert-error text-sm">{error}</div> : null}
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