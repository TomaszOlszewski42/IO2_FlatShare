import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { FormFieldError } from './form-field-error'

describe('FormFieldError', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when no error is provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.text-error')).toBeNull()
  })

  it('renders a single error message from error prop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError error="Field is required" />, container)
    })

    const error = container.querySelector('.text-error')

    expect(error).not.toBeNull()
    expect(error?.textContent).toBe('Field is required')
    expect(error?.classList.contains('text-sm')).toBe(true)
  })

  it('renders multiple error messages from errors prop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError errors={['Field is required', 'Value is too short']} />, container)
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Field is required')
    expect(errors[1]?.textContent).toBe('Value is too short')
  })

  it('ignores empty error messages from errors prop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError errors={['First error', '', 'Second error']} />, container)
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(container.textContent).toContain('First error')
    expect(container.textContent).toContain('Second error')
  })

  it('prefers errors prop over error prop when errors are provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError error="Single error" errors={['List error']} />, container)
    })

    expect(container.textContent).toContain('List error')
    expect(container.textContent).not.toContain('Single error')
  })
})