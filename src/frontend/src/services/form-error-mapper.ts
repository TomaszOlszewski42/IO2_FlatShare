import { ApiHttpError } from './api-client'

export type FormFieldErrors = Record<string, string[]>

export type FormErrorsResult = {
  summary: string | null
  fieldErrors: FormFieldErrors
}

type UnknownRecord = Record<string, unknown>

const DEFAULT_FORM_ERROR_MESSAGE = 'Something went wrong. Please try again.'

const GENERIC_ERROR_CODES = new Set([
  'ValidationError',
  'ModelValidationError',
  'InvalidRequest',
])

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readProperty(source: UnknownRecord, ...propertyNames: string[]): unknown {
  for (const propertyName of propertyNames) {
    if (propertyName in source) {
      return source[propertyName]
    }
  }

  return undefined
}

function readStringProperty(source: UnknownRecord, ...propertyNames: string[]): string | null {
  const value = readProperty(source, ...propertyNames)

  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null
}

function lowerFirst(value: string): string {
  if (value.length === 0) {
    return value
  }

  return value.charAt(0).toLowerCase() + value.slice(1)
}

function cleanFieldName(fieldName: string): string {
  return fieldName
    .replace(/^\$\./, '')
    .replace(/\[\d+\]/g, '')
    .trim()
}

function camelCasePath(fieldName: string): string {
  return fieldName
    .split('.')
    .map((segment) => lowerFirst(segment))
    .join('.')
}

function getLastFieldSegment(fieldName: string): string {
  const cleanedFieldName = cleanFieldName(fieldName)
  const segments = cleanedFieldName.split('.')

  return segments[segments.length - 1] ?? cleanedFieldName
}

function getFieldNameAliases(fieldName: string): string[] {
  const cleanedFieldName = cleanFieldName(fieldName)
  const lowerFirstFieldName = lowerFirst(cleanedFieldName)
  const camelCasedFieldName = camelCasePath(cleanedFieldName)
  const lastSegment = getLastFieldSegment(fieldName)
  const camelCasedLastSegment = lowerFirst(lastSegment)

  return Array.from(
    new Set(
      [
        fieldName,
        cleanedFieldName,
        lowerFirstFieldName,
        camelCasedFieldName,
        lastSegment,
        camelCasedLastSegment,
      ].filter((alias) => alias.trim().length > 0),
    ),
  )
}

function appendFieldError(
  result: FormFieldErrors,
  fieldName: string,
  message: string,
): void {
  if (!result[fieldName]) {
    result[fieldName] = []
  }

  if (!result[fieldName].includes(message)) {
    result[fieldName].push(message)
  }
}

function appendFieldErrorsWithAliases(
  result: FormFieldErrors,
  fieldName: string,
  messages: string[],
): void {
  const aliases = fieldName === 'general' ? ['general'] : getFieldNameAliases(fieldName)

  for (const alias of aliases) {
    for (const message of messages) {
      appendFieldError(result, alias, message)
    }
  }
}

function normalizeErrorMessages(value: unknown): string[] {
  if (typeof value === 'string' && value.trim().length > 0) {
    return [value.trim()]
  }

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      if (typeof item === 'string' && item.trim().length > 0) {
        return [item.trim()]
      }

      if (isRecord(item)) {
        const message = readStringProperty(
          item,
          'message',
          'Message',
          'errorMessage',
          'ErrorMessage',
        )

        return message ? [message] : []
      }

      return []
    })
  }

  if (isRecord(value)) {
    const message = readStringProperty(
      value,
      'message',
      'Message',
      'errorMessage',
      'ErrorMessage',
    )

    return message ? [message] : []
  }

  return []
}

function normalizeFieldErrors(value: unknown): FormFieldErrors {
  if (!value) {
    return {}
  }

  if (Array.isArray(value)) {
    const result: FormFieldErrors = {}

    for (const item of value) {
      if (!isRecord(item)) {
        continue
      }

      const fieldName =
        readStringProperty(item, 'field', 'Field', 'propertyName', 'PropertyName') ?? 'general'

      const messages = normalizeErrorMessages(
        readProperty(
          item,
          'message',
          'Message',
          'messages',
          'Messages',
          'errorMessage',
          'ErrorMessage',
        ),
      )

      appendFieldErrorsWithAliases(
        result,
        fieldName,
        messages.length > 0 ? messages : ['Invalid value.'],
      )
    }

    return result
  }

  if (isRecord(value)) {
    const result: FormFieldErrors = {}

    for (const [fieldName, fieldErrors] of Object.entries(value)) {
      const messages = normalizeErrorMessages(fieldErrors)

      appendFieldErrorsWithAliases(
        result,
        fieldName,
        messages.length > 0 ? messages : ['Invalid value.'],
      )
    }

    return result
  }

  return {}
}

function getErrorPayload(error: unknown): unknown {
  return error instanceof ApiHttpError ? error.body : error
}

function hasAnyFieldErrors(fieldErrors: FormFieldErrors): boolean {
  return Object.values(fieldErrors).some((messages) => messages.length > 0)
}

function isGenericErrorCode(value: string): boolean {
  return GENERIC_ERROR_CODES.has(value.trim())
}

function getErrorMessage(
  error: unknown,
  fallbackMessage: string,
  containsFieldErrors: boolean,
): string {
  const payload = getErrorPayload(error)

  if (isRecord(payload)) {
    const explicitMessage = readStringProperty(
      payload,
      'message',
      'Message',
      'detail',
      'Detail',
      'title',
      'Title',
    )

    if (explicitMessage) {
      return explicitMessage
    }

    const errorCode = readStringProperty(payload, 'error', 'Error')

    if (errorCode && !(containsFieldErrors && isGenericErrorCode(errorCode))) {
      return errorCode
    }

    if (error instanceof ApiHttpError && error.message.trim().length > 0) {
      const apiErrorMessage = error.message.trim()

      if (!(containsFieldErrors && isGenericErrorCode(apiErrorMessage))) {
        return apiErrorMessage
      }
    }

    return fallbackMessage
  }

  if (typeof payload === 'string' && payload.trim().length > 0) {
    return payload.trim()
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return fallbackMessage
}

export function mapFormErrors(
  error: unknown,
  fallbackMessage = DEFAULT_FORM_ERROR_MESSAGE,
): FormErrorsResult {
  const payload = getErrorPayload(error)

  if (!isRecord(payload)) {
    return {
      summary: getErrorMessage(error, fallbackMessage, false),
      fieldErrors: {},
    }
  }

  const fieldErrors = normalizeFieldErrors(
    readProperty(payload, 'fieldErrors', 'FieldErrors') ?? readProperty(payload, 'errors', 'Errors'),
  )

  return {
    summary: getErrorMessage(error, fallbackMessage, hasAnyFieldErrors(fieldErrors)),
    fieldErrors,
  }
}