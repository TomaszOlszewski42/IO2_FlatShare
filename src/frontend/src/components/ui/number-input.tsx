import type { JSX } from 'preact'

import { FormFieldError } from '../forms/form-field-error'
import { FormField } from './form-field'

type NumberInputProps = {
  id: string
  name: string
  label: string
  value: number | ''
  placeholder?: string
  min?: number
  max?: number
  step?: number
  required?: boolean
  disabled?: boolean
  error?: string
  errors?: string[]
  onInput: JSX.GenericEventHandler<HTMLInputElement>
}

export function NumberInput({
  id,
  name,
  label,
  value,
  placeholder,
  min,
  max,
  step,
  required = false,
  disabled = false,
  error,
  errors,
  onInput,
}: NumberInputProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <FormField id={id} label={label}>
      <input
        id={id}
        name={name}
        class={`input w-full ${hasError ? 'input-error' : 'input-bordered'}`}
        type="number"
        value={value}
        placeholder={placeholder}
        min={min}
        max={max}
        step={step}
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