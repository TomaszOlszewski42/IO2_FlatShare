import { TextInput } from '../ui/text-input'

type PasswordResetTokenFieldProps = {
  value: string
  disabled?: boolean
  errors?: string[]
  onInput: (event: Event) => void
}

export function PasswordResetTokenField({
  value,
  disabled = false,
  errors,
  onInput,
}: PasswordResetTokenFieldProps) {
  return (
    <TextInput
      id="resetToken"
      name="resetToken"
      label="Reset token"
      type="text"
      value={value}
      required
      disabled={disabled}
      errors={errors}
      onInput={onInput}
    />
  )
}