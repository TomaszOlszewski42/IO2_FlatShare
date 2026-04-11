import { useState } from 'preact/hooks'

import { PasswordResetRequestForm } from '../components/auth/password-reset-request-form'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'
import { requestPasswordReset } from '../services/password-reset-api'

export function PasswordResetRequestPage(_props: { path?: string }) {
  const [email, setEmail] = useState('')
  const { errorMessage, fieldErrors, clearErrors, handleError } = usePageErrorHandler()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: Event) {
    event.preventDefault()
    clearErrors()
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await requestPasswordReset({ email })
      setSuccessMessage(
        response.message || 'If the account exists, password reset instructions have been sent.',
      )
    } catch (caughtError) {
      handleError(caughtError, 'Request failed.')
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

      <PasswordResetRequestForm
        email={email}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        fieldErrors={fieldErrors}
        onEmailInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}