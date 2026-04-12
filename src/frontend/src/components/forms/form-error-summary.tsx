type FormErrorSummaryProps = {
  error?: string | null
}

export function FormErrorSummary({ error }: FormErrorSummaryProps) {
  if (!error) {
    return null
  }

  return (
    <div class="alert alert-error">
      <span>{error}</span>
    </div>
  )
}