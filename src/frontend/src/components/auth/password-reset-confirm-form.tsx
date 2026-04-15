import { AuthFormActions } from './auth-form-actions'
import { PasswordResetSuccessMessage } from './password-reset-success-message'
import { FormErrorSummary } from '../forms/form-error-summary'
import { TextInput } from '../ui/text-input'

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
      <TextInput
        id="resetToken"
        name="resetToken"
        label="Reset token"
        type="text"
        value={resetToken}
        required
        disabled={isSubmitting}
        errors={fieldErrors.resetToken}
        onInput={onResetTokenInput}
      />

      <TextInput
        id="newPassword"
        name="newPassword"
        label="New password"
        type="password"
        value={newPassword}
        required
        disabled={isSubmitting}
        errors={fieldErrors.newPassword}
        onInput={onNewPasswordInput}
      />

      <FormErrorSummary error={errorMessage} />
      <PasswordResetSuccessMessage message={successMessage} />

      <AuthFormActions
        isSubmitting={isSubmitting}
        idleLabel="Reset password"
        loadingLabel="Saving..."
      />
    </form>
  )
}