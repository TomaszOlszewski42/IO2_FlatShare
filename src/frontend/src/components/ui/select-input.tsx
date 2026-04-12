import { FormFieldError } from '../forms/form-field-error'

type SelectOption = {
  value: string
  label: string
}

type SelectInputProps = {
  id: string
  name: string
  label: string
  value: string
  options: SelectOption[]
  required?: boolean
  disabled?: boolean
  error?: string
  errors?: string[]
  placeholder?: string
  onChange: (event: Event) => void
}

export function SelectInput({
  id,
  name,
  label,
  value,
  options,
  required = false,
  disabled = false,
  error,
  errors,
  placeholder,
  onChange,
}: SelectInputProps) {
  const errorId = `${id}-error`
  const hasError = Boolean(error) || Boolean(errors?.length)

  return (
    <label class="form-control w-full" for={id}>
      <span class="label-text mb-1">{label}</span>
      <select
        id={id}
        name={name}
        class={`select w-full ${hasError ? 'select-error' : 'select-bordered'}`}
        value={value}
        required={required}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={hasError ? errorId : undefined}
        onChange={onChange}
      >
        {placeholder ? (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        ) : null}

        {options.map((option) => (
          <option value={option.value}>{option.label}</option>
        ))}
      </select>

      {hasError ? (
        <span id={errorId}>
          <FormFieldError error={error} errors={errors} />
        </span>
      ) : null}
    </label>
  )
}