import { useState } from 'preact/hooks'

import { mapFormErrors } from '../services/form-error-mapper'

type FieldErrors = Record<string, string[]>

export function usePageErrorHandler() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  function clearErrors() {
    setErrorMessage(null)
    setFieldErrors({})
  }

  function handleError(error: unknown, fallbackMessage = 'Something went wrong. Please try again.') {
    const mappedError = mapFormErrors(error)

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