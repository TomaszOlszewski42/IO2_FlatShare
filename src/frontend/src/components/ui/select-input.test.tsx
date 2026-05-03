import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { SelectInput } from './select-input'

describe('SelectInput', () => {
  const cityOptions = [
    { value: 'warsaw', label: 'Warsaw' },
    { value: 'krakow', label: 'Krakow' },
  ]

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and select options', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <SelectInput
          id="city"
          name="city"
          label="City"
          value="warsaw"
          options={cityOptions}
          onChange={handleChange}
        />,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const select = container.querySelector('select') as HTMLSelectElement
    const options = container.querySelectorAll('option')

    expect(legend?.textContent).toBe('City')
    expect(select).not.toBeNull()
    expect(select.id).toBe('city')
    expect(select.name).toBe('city')
    expect(select.value).toBe('warsaw')
    expect(select.classList.contains('select')).toBe(true)
    expect(select.classList.contains('select-bordered')).toBe(true)
    expect(options.length).toBe(2)
    expect(options[0]?.textContent).toBe('Warsaw')
    expect(options[1]?.textContent).toBe('Krakow')
  })

  it('renders placeholder option when placeholder is provided', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <SelectInput
          id="city"
          name="city"
          label="City"
          value=""
          options={cityOptions}
          placeholder="Select city"
          onChange={handleChange}
        />,
        container,
      )
    })

    const options = container.querySelectorAll('option')

    expect(options.length).toBe(3)
    expect(options[0]?.value).toBe('')
    expect(options[0]?.textContent).toBe('Select city')
  })

  it('disables placeholder option when field is required', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <SelectInput
          id="city"
          name="city"
          label="City"
          value=""
          options={cityOptions}
          placeholder="Select city"
          required
          onChange={handleChange}
        />,
        container,
      )
    })

    const placeholder = container.querySelector('option[value=""]') as HTMLOptionElement

    expect(placeholder.disabled).toBe(true)
  })

  it('supports required and disabled flags', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <SelectInput
          id="city"
          name="city"
          label="City"
          value="warsaw"
          options={cityOptions}
          required
          disabled
          onChange={handleChange}
        />,
        container,
      )
    })

    const select = container.querySelector('select') as HTMLSelectElement

    expect(select.required).toBe(true)
    expect(select.disabled).toBe(true)
  })

  it('calls onChange when change event is dispatched', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <SelectInput
          id="city"
          name="city"
          label="City"
          value="warsaw"
          options={cityOptions}
          onChange={handleChange}
        />,
        container,
      )
    })

    const select = container.querySelector('select') as HTMLSelectElement

    act(() => {
      select.value = 'krakow'
      select.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error state and error message', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <SelectInput
          id="city"
          name="city"
          label="City"
          value=""
          options={cityOptions}
          error="City jest wymagane"
          onChange={handleChange}
        />,
        container,
      )
    })

    const select = container.querySelector('select') as HTMLSelectElement
    const error = container.querySelector('.text-error')

    expect(select.classList.contains('select-error')).toBe(true)
    expect(select.getAttribute('aria-invalid')).toBe('true')
    expect(select.getAttribute('aria-describedby')).toBe('city-error')
    expect(error?.textContent).toBe('City jest wymagane')
  })
})