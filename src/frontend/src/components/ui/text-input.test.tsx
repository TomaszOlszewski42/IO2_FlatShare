import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { TextInput } from './text-input'

describe('TextInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and text input with basic attributes', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextInput
          id="title"
          name="title"
          label="Tytuł"
          value="Przytulny pokój"
          placeholder="Podaj tytuł"
          onInput={handleInput}
        />,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const input = container.querySelector('input') as HTMLInputElement

    expect(legend?.textContent).toBe('Tytuł')
    expect(input).not.toBeNull()
    expect(input.id).toBe('title')
    expect(input.name).toBe('title')
    expect(input.type).toBe('text')
    expect(input.value).toBe('Przytulny pokój')
    expect(input.placeholder).toBe('Podaj tytuł')
    expect(input.classList.contains('input')).toBe(true)
    expect(input.classList.contains('input-bordered')).toBe(true)
  })

  it('uses provided input type and autocomplete', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextInput
          id="email"
          name="email"
          label="Email"
          type="email"
          value="test@example.com"
          autoComplete="email"
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.type).toBe('email')
    expect(input.autocomplete).toBe('email')
  })

  it('supports required and disabled flags', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextInput
          id="password"
          name="password"
          label="Hasło"
          type="password"
          value=""
          required
          disabled
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.type).toBe('password')
    expect(input.required).toBe(true)
    expect(input.disabled).toBe(true)
  })

  it('calls onInput when input event is dispatched', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextInput
          id="city"
          name="city"
          label="Miasto"
          value=""
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    act(() => {
      input.value = 'Warszawa'
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
        <TextInput
          id="title"
          name="title"
          label="Tytuł"
          value=""
          error="Tytuł jest wymagany"
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('.text-error')

    expect(input.classList.contains('input-error')).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('title-error')
    expect(error?.textContent).toBe('Tytuł jest wymagany')
  })

  it('renders multiple validation errors', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextInput
          id="title"
          name="title"
          label="Tytuł"
          value=""
          errors={['Tytuł jest wymagany', 'Tytuł jest za krótki']}
          onInput={handleInput}
        />,
        container,
      )
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Tytuł jest wymagany')
    expect(errors[1]?.textContent).toBe('Tytuł jest za krótki')
  })
})