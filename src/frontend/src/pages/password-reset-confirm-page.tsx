import { useState } from 'preact/hooks'

import { PasswordResetConfirmForm } from '../components/auth/password-reset-confirm-form'
import { AuthCard } from '../components/layout/auth-card'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'
import { confirmPasswordReset } from '../services/password-reset-api'

export function PasswordResetConfirmPage(_props: { path?: string }) {
  const [resetToken, setResetToken] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const { errorMessage, fieldErrors, clearErrors, handleError } = usePageErrorHandler()
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: Event) {
    event.preventDefault()
    clearErrors()
    setSuccessMessage(null)
    setIsSubmitting(true)

    try {
      const response = await confirmPasswordReset({ resetToken, newPassword })
      setSuccessMessage(response.message || 'Password has been reset successfully.')
    } catch (caughtError) {
      handleError(caughtError, 'Request failed.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Set new password"
      subtitle="Paste your reset token and choose a new password."
    >
      <PasswordResetConfirmForm
        resetToken={resetToken}
        newPassword={newPassword}
        isSubmitting={isSubmitting}
        errorMessage={errorMessage}
        successMessage={successMessage}
        fieldErrors={fieldErrors}
        onResetTokenInput={(event) => setResetToken((event.currentTarget as HTMLInputElement).value)}
        onNewPasswordInput={(event) => setNewPassword((event.currentTarget as HTMLInputElement).value)}
        onSubmit={handleSubmit}
      />
    </AuthCard>
  )
}