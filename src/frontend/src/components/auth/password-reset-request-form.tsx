import { AuthFormActions } from './auth-form-actions'
import { PasswordResetSuccessMessage } from './password-reset-success-message'
import { FormErrorSummary } from '../forms/form-error-summary'
import { TextInput } from '../ui/text-input'

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
      <TextInput
        id="email"
        name="email"
        label="Email"
        type="email"
        value={email}
        required
        disabled={isSubmitting}
        errors={fieldErrors.email}
        onInput={onEmailInput}
      />

      <FormErrorSummary error={errorMessage} />
      <PasswordResetSuccessMessage message={successMessage} />

      <AuthFormActions
        isSubmitting={isSubmitting}
        idleLabel="Send reset instructions"
        loadingLabel="Sending..."
      />
    </form>
  )
}