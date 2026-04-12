import { ApiHttpError } from './api-client'
import { useErrorHandler, type FieldError, type ErrorInfo } from './error-handler-context'

export type HandleErrorOptions = {
  /**
   * If true, prevents showing the global toast and instead
   * lets the page handle field errors locally
   */
  captureFieldErrors?: boolean
}

/**
 * Hook for handling API errors with support for local overrides
 *
 * @example Local field error handling (for forms):
 * ```tsx
 * const { handleError } = usePageErrorHandler({ captureFieldErrors: true })
 *
 * try {
 *   await register(formData)
 * } catch (error) {
 *   handleError(error)
 *   // Get field errors from context to display in form
 *   const passwordErrors = getFieldErrors('password')
 * }
 * ```
 *
 * @example Default toast behavior (for other pages):
 * ```tsx
 * const { handleError } = usePageErrorHandler()
 *
 * try {
 *   await deleteUser()
 * } catch (error) {
 *   handleError(error) // Shows toast automatically
 * }
 * ```
 */
export function usePageErrorHandler(options: HandleErrorOptions = {}) {
  const errorHandler = useErrorHandler()
  const { captureFieldErrors = false } = options

  const handleError = (error: unknown) => {
    if (error instanceof ApiHttpError) {
      const errorInfo = parseApiError(error)

      if (captureFieldErrors && errorInfo.fieldErrors && errorInfo.fieldErrors.length > 0) {
        // Store field errors in context but don't show toast
        errorHandler.setFieldErrors(errorInfo.fieldErrors)
      } else {
        // Show as toast (default behavior)
        errorHandler.showError(errorInfo)
      }
    } else if (error instanceof Error) {
      errorHandler.showToast(error.message || 'An unexpected error occurred', 'error')
    } else {
      errorHandler.showToast('An unexpected error occurred', 'error')
    }
  }

  const getFieldError = (fieldName: string): string | null => {
    const errors = errorHandler.getFieldErrors(fieldName)
    return errors.length > 0 ? errors[0] : null
  }

  const getFieldErrors = (fieldName: string): string[] => {
    return errorHandler.getFieldErrors(fieldName)
  }

  const clearFieldErrors = () => {
    errorHandler.clearFieldErrors()
  }

  return {
    handleError,
    getFieldError,
    getFieldErrors,
    clearFieldErrors,
  }
}

/**
 * Parse ApiHttpError into a standardized ErrorInfo format
 */
export function parseApiError(error: ApiHttpError): ErrorInfo {
  let message = error.message || 'An error occurred. Please try again.'
  let fieldErrors: FieldError[] = []

  const response = error.body

  if (response && typeof response === 'object') {
    const responseData = response as Record<string, unknown>

    // Handle .NET Problem Detail format with 'errors' object
    if ('errors' in responseData && typeof responseData.errors === 'object' && responseData.errors !== null) {
      const errors = responseData.errors as Record<string, string[]>
      fieldErrors = Object.entries(errors).map(([field, messages]) => ({
        field,
        messages: Array.isArray(messages) ? messages : [String(messages)],
      }))

      // Use title, detail, or custom message
      message =
        (typeof responseData.title === 'string' ? responseData.title : null) ||
        (typeof responseData.detail === 'string' ? responseData.detail : null) ||
        (typeof responseData.message === 'string' ? responseData.message : null) ||
        message
    }
    // Handle fieldErrors array format
    else if ('fieldErrors' in responseData && Array.isArray(responseData.fieldErrors)) {
      const fe = responseData.fieldErrors as Array<{ field?: string; message?: string }>
      fieldErrors = fe.map((f) => ({
        field: f.field || '',
        messages: [f.message || ''],
      }))

      message = (typeof responseData.message === 'string' ? responseData.message : null) || message
    }
  }

  return {
    message,
    status: error.status,
    fieldErrors: fieldErrors.length > 0 ? fieldErrors : undefined,
  }
}
