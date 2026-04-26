import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { FileInput } from './file-input'

describe('FileInput', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and file input with basic attributes', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FileInput
          id="photos"
          name="photos"
          label="Zdjęcia"
          accept="image/*"
          onChange={handleChange}
        />,
        container,
      )
    })

    const label = container.querySelector('label')
    const labelText = container.querySelector('.label-text')
    const input = container.querySelector('input') as HTMLInputElement

    expect(label).not.toBeNull()
    expect(label?.getAttribute('for')).toBe('photos')
    expect(labelText?.textContent).toBe('Zdjęcia')

    expect(input).not.toBeNull()
    expect(input.id).toBe('photos')
    expect(input.name).toBe('photos')
    expect(input.type).toBe('file')
    expect(input.accept).toBe('image/*')
    expect(input.classList.contains('file-input')).toBe(true)
    expect(input.classList.contains('file-input-bordered')).toBe(true)
  })

  it('supports multiple and disabled flags', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FileInput
          id="photos"
          name="photos"
          label="Zdjęcia"
          multiple
          disabled
          onChange={handleChange}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    expect(input.multiple).toBe(true)
    expect(input.disabled).toBe(true)
  })

  it('calls onChange when change event is dispatched', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FileInput
          id="photos"
          name="photos"
          label="Zdjęcia"
          onChange={handleChange}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement

    act(() => {
      input.dispatchEvent(new Event('change', { bubbles: true }))
    })

    expect(handleChange).toHaveBeenCalledTimes(1)
  })

  it('renders error state and single error message', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FileInput
          id="photos"
          name="photos"
          label="Zdjęcia"
          error="Dodaj przynajmniej jedno zdjęcie"
          onChange={handleChange}
        />,
        container,
      )
    })

    const input = container.querySelector('input') as HTMLInputElement
    const error = container.querySelector('.text-error')

    expect(input.classList.contains('file-input-error')).toBe(true)
    expect(input.getAttribute('aria-invalid')).toBe('true')
    expect(input.getAttribute('aria-describedby')).toBe('photos-error')
    expect(error?.textContent).toBe('Dodaj przynajmniej jedno zdjęcie')
  })

  it('renders multiple validation errors', () => {
    const handleChange = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FileInput
          id="photos"
          name="photos"
          label="Zdjęcia"
          errors={['Plik jest za duży', 'Nieobsługiwany format pliku']}
          onChange={handleChange}
        />,
        container,
      )
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Plik jest za duży')
    expect(errors[1]?.textContent).toBe('Nieobsługiwany format pliku')
  })
})