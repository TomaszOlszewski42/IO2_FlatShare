import type { JSX } from 'preact'
import { FormFieldError } from '../forms/form-field-error'
import { FormField } from './form-field'

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
  errors?: string[]
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
  errors,
  onInput,
}: TextInputProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <FormField id={id} label={label}>
      <input
        id={id}
        name={name}
        class={`input w-full ${hasError ? 'input-error' : 'input-bordered'}`}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        onInput={onInput}
      />
      {hasError ? (
        <span id={errorId}>
          <FormFieldError error={error} errors={errors} />
        </span>
      ) : null}
    </FormField>
  )
}