import { route } from 'preact-router'

type AuthFormActionsProps = {
  isSubmitting?: boolean
  idleLabel: string
  loadingLabel: string
}

export function AuthFormActions({
  isSubmitting = false,
  idleLabel,
  loadingLabel,
}: AuthFormActionsProps) {
  return (
    <div class="flex gap-3">
      <button class="btn btn-primary" type="submit" disabled={isSubmitting}>
        {isSubmitting ? loadingLabel : idleLabel}
      </button>

      <button class="btn btn-ghost" type="button" onClick={() => route('/login')}>
        Back to login
      </button>
    </div>
  )
}