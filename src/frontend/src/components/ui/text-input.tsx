import type { JSX } from 'preact'

type TextInputProps = {
  id: string
  name: string
  label: string
  type?: 'text' | 'email' | 'password'
  value: string
  placeholder?: string
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  error?: string
  onInput: JSX.GenericEventHandler<HTMLInputElement>
}

export function TextInput({
  id,
  name,
  label,
  type = 'text',
  value,
  placeholder,
  autoComplete,
  required = false,
  disabled = false,
  error,
  onInput,
}: TextInputProps) {
  return (
    <label class="form-control w-full" for={id}>
      <span class="label-text mb-1">{label}</span>
      <input
        id={id}
        name={name}
        class={`input w-full ${error ? 'input-error' : 'input-bordered'}`}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        onInput={onInput}
      />
      {error ? <span class="mt-1 text-sm text-error">{error}</span> : null}
    </label>
  )
}
