import { afterEach, describe, expect, it, vi } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { TextArea } from './text-area'

describe('TextArea', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and textarea with basic attributes', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextArea
          id="description"
          name="description"
          label="Description"
          value="Bright room near the center"
          placeholder="Describe the apartment"
          onInput={handleInput}
        />,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    expect(legend?.textContent).toBe('Description')
    expect(textarea).not.toBeNull()
    expect(textarea.id).toBe('description')
    expect(textarea.name).toBe('description')
    expect(textarea.value).toBe('Bright room near the center')
    expect(textarea.placeholder).toBe('Describe the apartment')
    expect(textarea.rows).toBe(4)
    expect(textarea.classList.contains('textarea')).toBe(true)
    expect(textarea.classList.contains('textarea-bordered')).toBe(true)
  })

  it('supports custom rows value', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextArea
          id="description"
          name="description"
          label="Description"
          value=""
          rows={8}
          onInput={handleInput}
        />,
        container,
      )
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    expect(textarea.rows).toBe(8)
  })

  it('supports required and disabled flags', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextArea
          id="description"
          name="description"
          label="Description"
          value=""
          required
          disabled
          onInput={handleInput}
        />,
        container,
      )
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    expect(textarea.required).toBe(true)
    expect(textarea.disabled).toBe(true)
  })

  it('calls onInput when input event is dispatched', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextArea
          id="description"
          name="description"
          label="Description"
          value=""
          onInput={handleInput}
        />,
        container,
      )
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement

    act(() => {
      textarea.value = 'Nowy opis'
      textarea.dispatchEvent(new Event('input', { bubbles: true }))
    })

    expect(handleInput).toHaveBeenCalledTimes(1)
  })

  it('renders error state and error message', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextArea
          id="description"
          name="description"
          label="Description"
          value=""
          error="Description is required"
          onInput={handleInput}
        />,
        container,
      )
    })

    const textarea = container.querySelector('textarea') as HTMLTextAreaElement
    const error = container.querySelector('.text-error')

    expect(textarea.classList.contains('textarea-error')).toBe(true)
    expect(textarea.getAttribute('aria-invalid')).toBe('true')
    expect(textarea.getAttribute('aria-describedby')).toBe('description-error')
    expect(error?.textContent).toBe('Description is required')
  })

  it('renders multiple validation errors', () => {
    const handleInput = vi.fn()
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <TextArea
          id="description"
          name="description"
          label="Description"
          value=""
          errors={['Description is required', 'Description is too short']}
          onInput={handleInput}
        />,
        container,
      )
    })

    const errors = container.querySelectorAll('.text-error')

    expect(errors.length).toBe(2)
    expect(errors[0]?.textContent).toBe('Description is required')
    expect(errors[1]?.textContent).toBe('Description is too short')
  })
})