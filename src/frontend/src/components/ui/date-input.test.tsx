import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { DateInput } from './date-input'

describe('DateInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and date input with basic attributes', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <DateInput
          id="availableFrom"
          name="availableFrom"
          label="Available from"
          value="2025-03-01"
          onInput={handleInput}
        />,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const input = container.querySelector('input') as HTMLInputElement

    expect(legend?.textContent).toBe('Available from')
    expect(input).not.toBeNull()
    expect(input.id).toBe('availableFrom')
    expect(input.name).toBe('availableFrom')
    expect(input.type).toBe('date')
    expect(input.value).toBe('2025-03-01')
    expect(input.classList.contains('input')).toBe(true)
    expect(input.classList.contains('input-bordered')).toBe(true)
  })

  it('passes min and max attributes', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <DateInput
          id="availableFrom"
          name="availableFrom"
          label="Available from"
          value="2025-03-01"
          min="2025-01-01"
          max="2025-12-31"
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.getAttribute('min')).toBe('2025-01-01')
    expect(input.getAttribute('max')).toBe('2025-12-31')
  })

  it('supports required and disabled flags', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <DateInput
          id="availableTo"
          name="availableTo"
          label="Available until"
          value="2025-06-01"
          required
          disabled
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.required).toBe(true)
    expect(input.disabled).toBe(true)
  })

  it('calls onInput when input event is dispatched', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <DateInput
          id="availableFrom"
          name="availableFrom"
          label="Available from"
          value=""
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    act(() => {
      input.value = '2025-03-01'
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(handleInput).toHaveBeenCalledTimes(1)
  })

  it('renders error state and error message', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <DateInput
          id="availableFrom"
          name="availableFrom"
          label="Available from"
          value=""
          error="Availability date is required"
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('.text-error')

    expect(input.classList.contains('input-error')).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('availableFrom-error')
    expect(error?.textContent).toBe('Availability date is required')
  })

  it('renders multiple validation errors', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <DateInput
          id="availableFrom"
          name="availableFrom"
          label="Available from"
          value=""
          errors={['Data jest wymagana', 'Date cannot be in the past']}
          onInput={handleInput}
        />,
        container,
      )
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Data jest wymagana')
    expect(errors[1]?.textContent).toBe('Date cannot be in the past')
  })
})