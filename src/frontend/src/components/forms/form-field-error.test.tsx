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
      render(<FormFieldError error="Pole jest wymagane" />, container)
    })

    const error = container.querySelector('.text-error')

    expect(error).not.toBeNull()
    expect(error?.textContent).toBe('Pole jest wymagane')
    expect(error?.classList.contains('text-sm')).toBe(true)
  })

  it('renders multiple error messages from errors prop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError errors={['Pole jest wymagane', 'Wartość jest za krótka']} />, container)
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Pole jest wymagane')
    expect(errors[1]?.textContent).toBe('Wartość jest za krótka')
  })

  it('ignores empty error messages from errors prop', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError errors={['Pierwszy błąd', '', 'Drugi błąd']} />, container)
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(container.textContent).toContain('Pierwszy błąd')
    expect(container.textContent).toContain('Drugi błąd')
  })

  it('prefers errors prop over error prop when errors are provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormFieldError error="Błąd pojedynczy" errors={['Błąd z listy']} />, container)
    })

    expect(container.textContent).toContain('Błąd z listy')
    expect(container.textContent).not.toContain('Błąd pojedynczy')
  })
})