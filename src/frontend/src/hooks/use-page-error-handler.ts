import { useState } from 'preact/hooks'
import { mapFormErrors } from '../services/form-error-mapper'
import { ApiHttpError } from '../services/api-client'

type FieldErrors = Record<string, string[]>

export function usePageErrorHandler() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function clearErrors() {
    setErrorMessage(null)
    setFieldErrors({})
  }

  function handleError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.') {
    const source = error instanceof ApiHttpError ? error.body : error
    const mappedError = mapFormErrors(source)

    setErrorMessage(mappedError.summary ?? fallbackMessage)
    setFieldErrors(mappedError.fieldErrors)
  }

  return {
    errorMessage,
    fieldErrors,
    clearErrors,
    handleError,
    setErrorMessage,
    setFieldErrors,
  }
}