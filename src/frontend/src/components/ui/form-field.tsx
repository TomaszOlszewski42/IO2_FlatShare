import type { ComponentChildren } from 'preact'

type FormFieldProps = {
  id?: string
  label: string
  error?: string
  hint?: string
  children: ComponentChildren
}

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <fieldset class="fieldset w-full">
      <legend class="fieldset-legend" id={id ? `${id}-label` : undefined}>
        {label}
      </legend>
      {children}
      {error ? <p class="label text-error">{error}</p> : null}
      {!error && hint ? <p class="label">{hint}</p> : null}
    </fieldset>
  )
}