import { TextInput } from '../ui/text-input'

type PasswordResetEmailFieldProps = {
  value: string
  disabled?: boolean
  errors?: string[]
  onInput: (event: Event) => void
}

export function PasswordResetEmailField({
  value,
  disabled = false,
  errors,
  onInput,
}: PasswordResetEmailFieldProps) {
  return (
    <TextInput
      id="email"
      name="email"
      label="Email"
      type="email"
      value={value}
      required
      disabled={disabled}
      errors={errors}
      onInput={onInput}
    />
  )
}