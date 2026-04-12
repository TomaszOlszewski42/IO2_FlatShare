import type { JSX } from 'preact'

import { FormFieldError } from '../forms/form-field-error'

type DateInputProps = {
  id: string
  name: string
  label: string
  value: string
  min?: string
  max?: string
  required?: boolean
  disabled?: boolean
  error?: string
  errors?: string[]
  onInput: JSX.GenericEventHandler<HTMLInputElement>
}

export function DateInput({
  id,
  name,
  label,
  value,
  min,
  max,
  required = false,
  disabled = false,
  error,
  errors,
  onInput,
}: DateInputProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <label class="form-control w-full" for={id}>
      <span class="label-text mb-1">{label}</span>
      <input
        id={id}
        name={name}
        class={`input w-full ${hasError ? 'input-error' : 'input-bordered'}`}
        type="date"
        value={value}
        min={min}
        max={max}
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
    </label>
  )
}