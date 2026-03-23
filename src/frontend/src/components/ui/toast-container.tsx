import { Toast } from './toast'
import { useErrorHandler } from '../../services/error-handler-context'

export function ToastContainer() {
  const { toasts, removeToast } = useErrorHandler()

  return (
    <div class="fixed bottom-4 right-4 z-50 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onRemove={removeToast} />
      ))}
    </div>
  )
}
