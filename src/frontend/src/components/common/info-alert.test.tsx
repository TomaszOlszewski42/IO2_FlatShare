import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { InfoAlert } from './info-alert'

describe('InfoAlert', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders alert with info styling', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<InfoAlert>This is important information.</InfoAlert>, container)
    })

    const alert = container.querySelector('.alert')

    expect(alert).not.toBeNull()
    expect(alert?.classList.contains('alert-info')).toBe(true)
    expect(alert?.classList.contains('text-sm')).toBe(true)
    expect(container.textContent).toContain('This is important information.')
  })

  it('renders info icon', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<InfoAlert>Komunikat informacyjny</InfoAlert>, container)
    })

    const icon = container.querySelector('svg')
    const path = container.querySelector('path')

    expect(icon).not.toBeNull()
    expect(icon?.classList.contains('h-5')).toBe(true)
    expect(icon?.classList.contains('w-5')).toBe(true)
    expect(path?.getAttribute('stroke')).toBe('currentColor')
  })

  it('renders complex children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <InfoAlert>
          <strong>Uwaga:</strong> check the data before sending.
        </InfoAlert>,
        container,
      )
    })

    const strong = container.querySelector('strong')

    expect(strong).not.toBeNull()
    expect(strong?.textContent).toBe('Uwaga:')
    expect(container.textContent).toContain('check the data before sending.')
  })
})