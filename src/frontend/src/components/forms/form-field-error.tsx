type FormFieldErrorProps = {
  error?: string
  errors?: string[]
}

export function FormFieldError({ error, errors }: FormFieldErrorProps) {
  const normalizedErrors = errors?.filter(Boolean) ?? (error ? [error] : [])

  if (normalizedErrors.length === 0) {
    return null
  }

  return (
    <div class="mt-1 flex flex-col gap-1">
      {normalizedErrors.map((message) => (
        <span class="text-sm text-error">{message}</span>
      ))}
    </div>
  )
}