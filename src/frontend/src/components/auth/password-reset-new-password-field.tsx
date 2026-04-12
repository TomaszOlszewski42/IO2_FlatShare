import { TextInput } from '../ui/text-input'

type PasswordResetNewPasswordFieldProps = {
  value: string
  disabled?: boolean
  errors?: string[]
  onInput: (event: Event) => void
}

export function PasswordResetNewPasswordField({
  value,
  disabled = false,
  errors,
  onInput,
}: PasswordResetNewPasswordFieldProps) {
  return (
    <TextInput
      id="newPassword"
      name="newPassword"
      label="New password"
      type="password"
      value={value}
      required
      disabled={disabled}
      errors={errors}
      onInput={onInput}
    />
  )
}