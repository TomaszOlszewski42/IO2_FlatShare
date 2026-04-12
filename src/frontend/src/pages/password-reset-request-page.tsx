import { useState } from 'preact/hooks'
import { route } from 'preact-router'
import { requestPasswordReset } from '../services/password-reset-api'
import { ApiHttpError } from '../services/api-client'

export function PasswordResetRequestPage(_props: { path?: string }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: Event) {
    event.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await requestPasswordReset({ email })
      setSuccessMessage(
        response.message || 'If the account exists, password reset instructions have been sent.',
      )
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
        <h1 class="text-2xl font-semibold">Reset password</h1>
        <p class="text-sm opacity-80">
          Enter your email address and we will send you password reset instructions.
        </p>
      </div>

      <form class="space-y-4" onSubmit={handleSubmit}>
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input
            id="email"
            type="email"
            class="input input-bordered w-full"
            value={email}
            onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
            required
          />
        </div>

        {error ? <div class="alert alert-error text-sm">{error}</div> : null}
        {successMessage ? <div class="alert alert-success text-sm">{successMessage}</div> : null}

        <div class="flex gap-3">
          <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Sending...' : 'Send reset instructions'}
          </button>

          <button class="btn btn-ghost" type="button" onClick={() => route('/login')}>
            Back to login
          </button>
        </div>
      </form>
    </div>
  )
}