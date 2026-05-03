import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { FormField } from './form-field'

describe('FormField', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField id="email" label="Adres email">
          <input id="email" type="email" />
        </FormField>,
        container,
      )
    })

    const legend = container.querySelector('legend')
    const input = container.querySelector('input')

    expect(legend).not.toBeNull()
    expect(legend?.textContent).toBe('Adres email')
    expect(legend?.getAttribute('id')).toBe('email-label')
    expect(input).not.toBeNull()
    expect(input?.getAttribute('type')).toBe('email')
  })

  it('does not assign label id when field id is not provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Description">
          <textarea />
        </FormField>,
        container,
      )
    })

    const legend = container.querySelector('legend')

    expect(legend?.textContent).toBe('Description')
    expect(legend?.hasAttribute('id')).toBe(false)
  })

  it('renders hint when there is no error', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Price" hint="Enter the amount in PLN">
          <input type="number" />
        </FormField>,
        container,
      )
    })

    expect(container.textContent).toContain('Enter the amount in PLN')
  })

  it('renders error instead of hint when error is provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Price" hint="Enter the amount in PLN" error="Price jest wymagana">
          <input type="number" />
        </FormField>,
        container,
      )
    })

    expect(container.textContent).toContain('Price jest wymagana')
    expect(container.textContent).not.toContain('Enter the amount in PLN')
  })

  it('marks error message with error styling class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Title" error="Title is required">
          <input type="text" />
        </FormField>,
        container,
      )
    })

    const errorMessage = container.querySelector('.text-error')

    expect(errorMessage).not.toBeNull()
    expect(errorMessage?.textContent).toBe('Title is required')
  })
})