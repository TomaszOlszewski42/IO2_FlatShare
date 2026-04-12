import type { JSX } from 'preact'

import { FormFieldError } from '../forms/form-field-error'

type FileInputProps = {
  id: string
  name: string
  label: string
  accept?: string
  multiple?: boolean
  disabled?: boolean
  error?: string
  errors?: string[]
  onChange: JSX.GenericEventHandler<HTMLInputElement>
}

export function FileInput({
  id,
  name,
  label,
  accept,
  multiple = false,
  disabled = false,
  error,
  errors,
  onChange,
}: FileInputProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <label class="form-control w-full" for={id}>
      <span class="label-text mb-1">{label}</span>
      <input
        id={id}
        name={name}
        type="file"
        class={`file-input w-full ${hasError ? 'file-input-error' : 'file-input-bordered'}`}
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        onChange={onChange}
      />

      {hasError ? (
        <span id={errorId}>
          <FormFieldError error={error} errors={errors} />
        </span>
      ) : null}
    </label>
  )
}