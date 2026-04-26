import { describe, expect, it } from 'vitest'

import { ApiHttpError } from './api-client'
import { mapFormErrors } from './form-error-mapper'

describe('mapFormErrors', () => {
  it('maps new API error format with fieldErrors array', () => {
    const error = new ApiHttpError(400, 'ValidationError', {
      timestamp: '2026-04-26T16:00:00Z',
      status: 400,
      error: 'ValidationError',
      message: 'Invalid request data.',
      path: '/api/v1/users/me/preferences',
      fieldErrors: [
        {
          field: 'maxPrice',
          message: 'Max price must be greater than or equal to 0.',
        },
        {
          field: 'preferredDistricts',
          message: 'At least one preferred district is invalid.',
        },
      ],
    })

    const result = mapFormErrors(error, 'Fallback message.')

    expect(result.summary).toBe('Invalid request data.')
    expect(result.fieldErrors.maxPrice).toEqual(['Max price must be greater than or equal to 0.'])
    expect(result.fieldErrors.preferredDistricts).toEqual(['At least one preferred district is invalid.'])
  })

  it('maps old API validation format with errors object', () => {
    const error = new ApiHttpError(400, 'Validation failed.', {
      message: 'Validation failed.',
      errors: {
        email: ['Email is required.', 'Email must be valid.'],
        password: 'Password is required.',
      },
    })

    const result = mapFormErrors(error, 'Fallback message.')

    expect(result.summary).toBe('Validation failed.')
    expect(result.fieldErrors.email).toEqual(['Email is required.', 'Email must be valid.'])
    expect(result.fieldErrors.password).toEqual(['Password is required.'])
  })

  it('normalizes PascalCase field names from backend', () => {
    const error = new ApiHttpError(400, 'ValidationError', {
      error: 'ValidationError',
      fieldErrors: [
        {
          field: 'MaxPrice',
          message: 'Max price is invalid.',
        },
        {
          field: 'Email',
          message: 'Email is invalid.',
        },
      ],
    })

    const result = mapFormErrors(error, 'Please fix the form.')

    expect(result.summary).toBe('Please fix the form.')
    expect(result.fieldErrors.MaxPrice).toEqual(['Max price is invalid.'])
    expect(result.fieldErrors.maxPrice).toEqual(['Max price is invalid.'])
    expect(result.fieldErrors.Email).toEqual(['Email is invalid.'])
    expect(result.fieldErrors.email).toEqual(['Email is invalid.'])
  })

  it('normalizes nested and JSON path field names from backend', () => {
    const error = new ApiHttpError(400, 'ValidationError', {
      error: 'ValidationError',
      fieldErrors: [
        {
          field: 'Location.City',
          message: 'City is required.',
        },
        {
          field: '$.preferredDistricts[0]',
          message: 'Preferred district is invalid.',
        },
      ],
    })

    const result = mapFormErrors(error, 'Please fix the form.')

    expect(result.fieldErrors['Location.City']).toEqual(['City is required.'])
    expect(result.fieldErrors['location.City']).toEqual(['City is required.'])
    expect(result.fieldErrors.City).toEqual(['City is required.'])
    expect(result.fieldErrors.city).toEqual(['City is required.'])

    expect(result.fieldErrors['preferredDistricts']).toEqual(['Preferred district is invalid.'])
  })

  it('uses error or ApiHttpError message as summary when there are no field errors', () => {
    const error = new ApiHttpError(404, 'Request failed with status 404', {
      status: 404,
      error: 'PreferencesNotFound',
      path: '/api/v1/users/me/preferences',
    })

    const result = mapFormErrors(error, 'Fallback message.')

    expect(result.summary).toBe('PreferencesNotFound')
    expect(result.fieldErrors).toEqual({})
  })

  it('uses fallback summary for generic validation code when field errors exist', () => {
    const error = new ApiHttpError(400, 'ValidationError', {
      error: 'ValidationError',
      fieldErrors: [
        {
          field: 'title',
          message: 'Title is required.',
        },
      ],
    })

    const result = mapFormErrors(error, 'Please fix the highlighted fields.')

    expect(result.summary).toBe('Please fix the highlighted fields.')
    expect(result.fieldErrors.title).toEqual(['Title is required.'])
  })

  it('handles non-object errors safely', () => {
    const result = mapFormErrors(null, 'Fallback message.')

    expect(result.summary).toBe('Fallback message.')
    expect(result.fieldErrors).toEqual({})
  })
})