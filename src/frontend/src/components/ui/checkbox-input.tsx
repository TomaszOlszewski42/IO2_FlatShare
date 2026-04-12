import type { JSX } from 'preact'

import { FormFieldError } from '../forms/form-field-error'

type CheckboxInputProps = {
  id: string
  name: string
  label: string
  checked: boolean
  disabled?: boolean
  error?: string
  errors?: string[]
  onChange: JSX.GenericEventHandler<HTMLInputElement>
}

export function CheckboxInput({
  id,
  name,
  label,
  checked,
  disabled = false,
  error,
  errors,
  onChange,
}: CheckboxInputProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <div class="form-control w-full">
      <label class="label cursor-pointer justify-start gap-3" for={id}>
        <input
          id={id}
          name={name}
          type="checkbox"
          class={`checkbox ${hasError ? 'checkbox-error' : ''}`}
          checked={checked}
          disabled={disabled}
          aria-invalid={hasError}
          aria-describedby={hasError ? errorId : undefined}
          onChange={onChange}
        />
        <span class="label-text">{label}</span>
      </label>

      {hasError ? (
        <span id={errorId}>
          <FormFieldError error={error} errors={errors} />
        </span>
      ) : null}
    </div>
  )
}