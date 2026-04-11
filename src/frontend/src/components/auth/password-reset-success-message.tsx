type PasswordResetSuccessMessageProps = {
  message?: string | null
}

export function PasswordResetSuccessMessage({
  message,
}: PasswordResetSuccessMessageProps) {
  if (!message) {
    return null
  }

  return <div class="alert alert-success text-sm">{message}</div>
}