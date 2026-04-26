import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { SelectInput } from './select-input'

describe('SelectInput', () => {
  const cityOptions = [
    { value: 'warszawa', label: 'Warszawa' },
    { value: 'krakow', label: 'Kraków' },
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
          label="Miasto"
          value="warszawa"
          options={cityOptions}
          onChange={handleChange}
        />,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const select = container.querySelector('select') as HTMLSelectElement
    const options = container.querySelectorAll('option')

    expect(legend?.textContent).toBe('Miasto')
    expect(select).not.toBeNull()
    expect(select.id).toBe('city')
    expect(select.name).toBe('city')
    expect(select.value).toBe('warszawa')
    expect(select.classList.contains('select')).toBe(true)
    expect(select.classList.contains('select-bordered')).toBe(true)
    expect(options.length).toBe(2)
    expect(options[0]?.textContent).toBe('Warszawa')
    expect(options[1]?.textContent).toBe('Kraków')
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
          label="Miasto"
          value=""
          options={cityOptions}
          placeholder="Wybierz miasto"
          onChange={handleChange}
        />,
        container,
      )
    })

    const options = container.querySelectorAll('option')

    expect(options.length).toBe(3)
    expect(options[0]?.value).toBe('')
    expect(options[0]?.textContent).toBe('Wybierz miasto')
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
          label="Miasto"
          value=""
          options={cityOptions}
          placeholder="Wybierz miasto"
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
          label="Miasto"
          value="warszawa"
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
          label="Miasto"
          value="warszawa"
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
          label="Miasto"
          value=""
          options={cityOptions}
          error="Miasto jest wymagane"
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
    expect(error?.textContent).toBe('Miasto jest wymagane')
  })
})