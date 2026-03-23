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
    <div class="w-full">
      <label class={`input w-full ${error ? 'input-error' : 'input-bordered'}`}>
        <span class="label text-sm">{label}</span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          onInput={onInput}
        />
      </label>
      {error ? <p class="label text-error whitespace-normal break-words leading-snug">{error}</p> : null}
    </div>
  )
}
