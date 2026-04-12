import type { Toast } from '../../services/error-handler-context'

type ToastProps = {
  toast: Toast
  onRemove: (id: string) => void
}

export function Toast({ toast, onRemove }: ToastProps) {
  const alertClasses: Record<Toast['type'], string> = {
    error: 'alert-error',
    success: 'alert-success',
    warning: 'alert-warning',
    info: 'alert-info',
  }
  const alertClass = alertClasses[toast.type]

  return (
    <div class={`alert alert-soft ${alertClass}`} role="alert">
      <span>{toast.message}</span>
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        class="btn btn-ghost btn-sm btn-circle"
        aria-label="Close notification"
      >
        ✕
      </button>
    </div>
  )
}
