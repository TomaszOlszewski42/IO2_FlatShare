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
        <FormField label="Opis">
          <textarea />
        </FormField>,
        container,
      )
    })

    const legend = container.querySelector('legend')

    expect(legend?.textContent).toBe('Opis')
    expect(legend?.hasAttribute('id')).toBe(false)
  })

  it('renders hint when there is no error', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Cena" hint="Podaj kwotę w złotówkach">
          <input type="number" />
        </FormField>,
        container,
      )
    })

    expect(container.textContent).toContain('Podaj kwotę w złotówkach')
  })

  it('renders error instead of hint when error is provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Cena" hint="Podaj kwotę w złotówkach" error="Cena jest wymagana">
          <input type="number" />
        </FormField>,
        container,
      )
    })

    expect(container.textContent).toContain('Cena jest wymagana')
    expect(container.textContent).not.toContain('Podaj kwotę w złotówkach')
  })

  it('marks error message with error styling class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <FormField label="Tytuł" error="Tytuł jest wymagany">
          <input type="text" />
        </FormField>,
        container,
      )
    })

    const errorMessage = container.querySelector('.text-error')

    expect(errorMessage).not.toBeNull()
    expect(errorMessage?.textContent).toBe('Tytuł jest wymagany')
  })
})