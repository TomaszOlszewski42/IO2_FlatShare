import { Toast } from './toast'
import { useErrorHandler } from '../../services/error-handler-context'

export function ToastContainer() {
  const { toasts, removeToast } = useErrorHandler()

  return (
    <div class="toast toast-top toast-end z-50">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
