import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { CheckboxInput } from './checkbox-input'

describe('CheckboxInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and checkbox with basic attributes', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CheckboxInput
          id="petsAllowed"
          name="petsAllowed"
          label="Akceptuję zwierzęta"
          checked={true}
          onChange={handleChange}
        />,
        container,
      )
    })

    const label = container.querySelector('label')
    const checkbox = container.querySelector('input') as HTMLInputElement
    const labelText = container.querySelector('.label-text')

    expect(label).not.toBeNull()
    expect(label?.getAttribute('for')).toBe('petsAllowed')
    expect(labelText?.textContent).toBe('Akceptuję zwierzęta')
    expect(checkbox).not.toBeNull()
    expect(checkbox.id).toBe('petsAllowed')
    expect(checkbox.name).toBe('petsAllowed')
    expect(checkbox.type).toBe('checkbox')
    expect(checkbox.checked).toBe(true)
    expect(checkbox.classList.contains('checkbox')).toBe(true)
  })

  it('supports unchecked state', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CheckboxInput
          id="nonSmokingOnly"
          name="nonSmokingOnly"
          label="Tylko niepalący"
          checked={false}
          onChange={handleChange}
        />,
        container,
      )
    })

    const checkbox = container.querySelector('input') as HTMLInputElement

    expect(checkbox.checked).toBe(false)
  })

  it('supports disabled flag', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CheckboxInput
          id="petsAllowed"
          name="petsAllowed"
          label="Akceptuję zwierzęta"
          checked={false}
          disabled
          onChange={handleChange}
        />,
        container,
      )
    })

    const checkbox = container.querySelector('input') as HTMLInputElement

    expect(checkbox.disabled).toBe(true)
  })

  it('calls onChange when change event is dispatched', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CheckboxInput
          id="petsAllowed"
          name="petsAllowed"
          label="Akceptuję zwierzęta"
          checked={false}
          onChange={handleChange}
        />,
        container,
      )
    })

    const checkbox = container.querySelector('input') as HTMLInputElement

    act(() => {
      checkbox.checked = true
      checkbox.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error state and error message', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CheckboxInput
          id="terms"
          name="terms"
          label="Akceptuję regulamin"
          checked={false}
          error="Musisz zaakceptować regulamin"
          onChange={handleChange}
        />,
        container,
      )
    })

    const checkbox = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('.text-error')

    expect(checkbox.classList.contains('checkbox-error')).toBe(true)
    expect(checkbox.getAttribute('aria-invalid')).toBe('true')
    expect(checkbox.getAttribute('aria-describedby')).toBe('terms-error')
    expect(error?.textContent).toBe('Musisz zaakceptować regulamin')
  })

  it('renders multiple validation errors', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <CheckboxInput
          id="rules"
          name="rules"
          label="Akceptuję zasady"
          checked={false}
          errors={['Pierwszy błąd', 'Drugi błąd']}
          onChange={handleChange}
        />,
        container,
      )
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Pierwszy błąd')
    expect(errors[1]?.textContent).toBe('Drugi błąd')
  })
})