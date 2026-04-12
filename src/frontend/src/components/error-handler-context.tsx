import { createContext } from 'preact'
import { useContext } from 'preact/hooks'
import type { ComponentChildren } from 'preact'

type FieldErrors = Record<string, string[]>

type ErrorHandlerContextValue = {
  errorMessage: string | null
  fieldErrors: FieldErrors
  clearErrors: () => void
  handleError: (error: unknown, fallbackMessage?: string) => void
  setErrorMessage: (value: string | null) => void
  setFieldErrors: (value: FieldErrors) => void
}

const ErrorHandlerContext = createContext<ErrorHandlerContextValue | undefined>(undefined)

type ErrorHandlerProviderProps = {
  value: ErrorHandlerContextValue
  children: ComponentChildren
}

export function ErrorHandlerProvider({
  value,
  children,
}: ErrorHandlerProviderProps) {
  return <ErrorHandlerContext.Provider value={value}>{children}</ErrorHandlerContext.Provider>
}

export function useErrorHandlerContext() {
  const context = useContext(ErrorHandlerContext)

  if (!context) {
    throw new Error('useErrorHandlerContext must be used within ErrorHandlerProvider')
  }

  return context
}