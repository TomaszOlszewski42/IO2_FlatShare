import { createContext } from 'preact'
import { useContext, useState } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

export type FieldError = {
  field: string
  messages: string[]
}

export type ErrorInfo = {
  message: string
  status?: number
  fieldErrors?: FieldError[]
}

export type Toast = {
  id: string
  type: 'error' | 'success' | 'warning' | 'info'
  message: string
  duration?: number
}

interface ErrorHandlerContextType {
  toasts: Toast[]
  showToast: (message: string, type?: Toast['type'], duration?: number) => void
  removeToast: (id: string) => void
  showError: (error: ErrorInfo) => void
  getFieldErrors: (fieldName: string) => string[]
  clearFieldErrors: () => void
  setFieldErrors: (errors: FieldError[]) => void
}

const ErrorHandlerContext = createContext<ErrorHandlerContextType | null>(null)

type ErrorHandlerProviderProps = {
  children: ComponentChildren
}

export function ErrorHandlerProvider({ children }: ErrorHandlerProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const [fieldErrors, setFieldErrors] = useState<FieldError[]>([])

  const generateId = () => Math.random().toString(36).slice(2)

  const showToast = (message: string, type: Toast['type'] = 'error', duration = 5000) => {
    const id = generateId()
    const toast: Toast = { id, message, type, duration }

    setToasts((prev) => [...prev, toast])

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id)
      }, duration)
    }
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  const showError = (error: ErrorInfo) => {
    // Store field errors if present
    if (error.fieldErrors && error.fieldErrors.length > 0) {
      setFieldErrors(error.fieldErrors)
    }

    // Show general error as toast
    showToast(error.message, 'error')
  }

  const getFieldErrors = (fieldName: string): string[] => {
    const field = fieldErrors.find((f) => f.field.toLowerCase() === fieldName.toLowerCase())
    return field?.messages ?? []
  }

  const clearFieldErrors = () => {
    setFieldErrors([])
  }

  return (
    <ErrorHandlerContext.Provider
      value={{
        toasts,
        showToast,
        removeToast,
        showError,
        getFieldErrors,
        clearFieldErrors,
        setFieldErrors,
      }}
    >
      {children}
    </ErrorHandlerContext.Provider>
  )
}

export function useErrorHandler() {
  const context = useContext(ErrorHandlerContext)
  if (!context) {
    throw new Error('useErrorHandler must be used within ErrorHandlerProvider')
  }
  return context
}
