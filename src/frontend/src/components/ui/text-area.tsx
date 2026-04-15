import type { JSX } from 'preact'

import { FormFieldError } from '../forms/form-field-error'
import { FormField } from './form-field'

type TextAreaProps = {
  id: string
  name: string
  label: string
  value: string
  placeholder?: string
  rows?: number
  required?: boolean
  disabled?: boolean
  error?: string
  errors?: string[]
  onInput: JSX.GenericEventHandler<HTMLTextAreaElement>
}

export function TextArea({
  id,
  name,
  label,
  value,
  placeholder,
  rows = 4,
  required = false,
  disabled = false,
  error,
  errors,
  onInput,
}: TextAreaProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <FormField id={id} label={label}>
      <textarea
        id={id}
        name={name}
        class={`textarea w-full ${hasError ? 'textarea-error' : 'textarea-bordered'}`}
        value={value}
        placeholder={placeholder}
        rows={rows}
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