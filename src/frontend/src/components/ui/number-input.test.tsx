import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { NumberInput } from './number-input'

describe('NumberInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and number input with basic attributes', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <NumberInput
          id="price"
          name="price"
          label="Price"
          value={1200}
          placeholder="Enter price"
          onInput={handleInput}
        />,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const input = container.querySelector('input') as HTMLInputElement

    expect(legend?.textContent).toBe('Price')
    expect(input).not.toBeNull()
    expect(input.id).toBe('price')
    expect(input.name).toBe('price')
    expect(input.type).toBe('number')
    expect(input.value).toBe('1200')
    expect(input.placeholder).toBe('Enter price')
    expect(input.classList.contains('input')).toBe(true)
    expect(input.classList.contains('input-bordered')).toBe(true)
  })

  it('supports empty value', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <NumberInput
          id="deposit"
          name="deposit"
          label="Kaucja"
          value=""
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.value).toBe('')
  })

  it('passes min, max and step attributes', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <NumberInput
          id="area"
          name="area"
          label="Area"
          value={20}
          min={1}
          max={100}
          step={0.5}
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.getAttribute('min')).toBe('1')
    expect(input.getAttribute('max')).toBe('100')
    expect(input.getAttribute('step')).toBe('0.5')
  })

  it('supports required and disabled flags', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <NumberInput
          id="rooms"
          name="rooms"
          label="Number of rooms"
          value={2}
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
        <NumberInput
          id="price"
          name="price"
          label="Price"
          value=""
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    act(() => {
      input.value = '1500'
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
        <NumberInput
          id="price"
          name="price"
          label="Price"
          value=""
          error="Price is required"
          onInput={handleInput}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('.text-error')

    expect(input.classList.contains('input-error')).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('price-error')
    expect(error?.textContent).toBe('Price is required')
  })
})