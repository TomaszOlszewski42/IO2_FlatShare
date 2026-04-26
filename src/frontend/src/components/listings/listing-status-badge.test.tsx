import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingStatusBadge } from './listing-status-badge'

describe('ListingStatusBadge', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders active status label and success class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingStatusBadge status="ACTIVE" />, container)
    })

    const badge = container.querySelector('span')

    expect(badge).not.toBeNull()
    expect(badge?.textContent).toBe('Aktywne')
    expect(badge?.classList.contains('badge')).toBe(true)
    expect(badge?.classList.contains('badge-soft')).toBe(true)
    expect(badge?.classList.contains('badge-success')).toBe(true)
  })

  it('renders awaiting review status label and info class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingStatusBadge status="AWAITING_REVIEW" />, container)
    })

    const badge = container.querySelector('span')

    expect(badge?.textContent).toBe('W oczekiwaniu na akceptacje')
    expect(badge?.classList.contains('badge-info')).toBe(true)
  })

  it('renders awaiting fixes status label and warning class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingStatusBadge status="AWAITING_FIXES" />, container)
    })

    const badge = container.querySelector('span')

    expect(badge?.textContent).toBe('Wymaga poprawek')
    expect(badge?.classList.contains('badge-warning')).toBe(true)
  })

  it('renders hidden by moderation status label and error class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingStatusBadge status="HIDDEN_BY_MODERATION" />, container)
    })

    const badge = container.querySelector('span')

    expect(badge?.textContent).toBe('Ukryte przez moderacje')
    expect(badge?.classList.contains('badge-error')).toBe(true)
  })

  it('renders archived status label and neutral class', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingStatusBadge status="ARCHIVED" />, container)
    })

    const badge = container.querySelector('span')

    expect(badge?.textContent).toBe('Zarchiwizowane')
    expect(badge?.classList.contains('badge-neutral')).toBe(true)
  })
})