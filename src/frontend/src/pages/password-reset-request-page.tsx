import { useState } from 'preact/hooks'

import { PasswordResetRequestForm } from '../components/auth/password-reset-request-form'
import { AuthCard } from '../components/layout/auth-card'
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
    <AuthCard
      title="Reset password"
      subtitle="Enter your email address and we will send you password reset instructions."
    >
      <PasswordResetRequestForm
        email={email}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        fieldErrors={fieldErrors}
        onEmailInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
        onSubmit={handleSubmit}
      />
    </AuthCard>
  )
}