import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { FormErrorSummary } from './form-error-summary'

describe('FormErrorSummary', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders nothing when error is undefined', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormErrorSummary />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.alert')).toBeNull()
  })

  it('renders nothing when error is null', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormErrorSummary error={null} />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.alert')).toBeNull()
  })

  it('renders nothing when error is empty string', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormErrorSummary error="" />, container)
    })

    expect(container.textContent).toBe('')
    expect(container.querySelector('.alert')).toBeNull()
  })

  it('renders error alert when error is provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<FormErrorSummary error="Nie udało się zapisać formularza" />, container)
    })

    const alert = container.querySelector('.alert')
    const message = container.querySelector('span')

    expect(alert).not.toBeNull()
    expect(alert?.classList.contains('alert-error')).toBe(true)
    expect(message?.textContent).toBe('Nie udało się zapisać formularza')
  })
})