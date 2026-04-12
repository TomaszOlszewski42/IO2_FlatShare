import { useState } from 'preact/hooks'
import { route } from 'preact-router'

import { FormErrorSummary } from '../components/forms/form-error-summary'
import { TextInput } from '../components/ui/text-input'
import { mapFormErrors } from '../services/form-error-mapper'
import { requestPasswordReset } from '../services/password-reset-api'

export function PasswordResetRequestPage(_props: { path?: string }) {
  const [email, setEmail] = useState('')
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
      const response = await requestPasswordReset({ email })
      setSuccessMessage(
        response.message || 'If the account exists, password reset instructions have been sent.',
      )
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
        <h1 class="text-2xl font-semibold">Reset password</h1>
        <p class="text-sm opacity-80">
          Enter your email address and we will send you password reset instructions.
        </p>
      </div>

      <form class="space-y-6" onSubmit={handleSubmit}>
        <TextInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value={email}
          required
          disabled={isSubmitting}
          errors={fieldErrors.email}
          onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
        />

        <FormErrorSummary error={error} />
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