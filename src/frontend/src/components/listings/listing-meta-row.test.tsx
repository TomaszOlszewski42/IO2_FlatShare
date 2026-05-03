import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingMetaRow } from './listing-meta-row'

describe('ListingMetaRow', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders label and value', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingMetaRow label="City" value="Warsaw" />, container)
    })

    const row = container.firstElementChild
    const spans = container.querySelectorAll('span')

    expect(row).not.toBeNull()
    expect(row?.classList.contains('flex')).toBe(true)
    expect(row?.classList.contains('justify-between')).toBe(true)

    expect(spans.length).toBe(2)
    expect(spans[0]?.textContent).toBe('City')
    expect(spans[1]?.textContent).toBe('Warsaw')
  })

  it('renders icon before label when provided', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingMetaRow label="Price" value="1 500 PLN" icon="💰" />, container)
    })

    const label = container.querySelector('span')

    expect(label?.textContent).toBe('💰 Price')
  })

  it('uses muted styling for label and stronger styling for value', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingMetaRow label="Area" value="20 m²" />, container)
    })

    const spans = container.querySelectorAll('span')
    const label = spans[0]
    const value = spans[1]

    expect(label?.classList.contains('text-base-content/65')).toBe(true)
    expect(value?.classList.contains('font-medium')).toBe(true)
    expect(value?.classList.contains('text-base-content')).toBe(true)
  })

  it('renders row with border and spacing classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingMetaRow label="Available from" value="2025-03-01" />, container)
    })

    const row = container.firstElementChild

    expect(row?.classList.contains('items-center')).toBe(true)
    expect(row?.classList.contains('gap-3')).toBe(true)
    expect(row?.classList.contains('border-b')).toBe(true)
    expect(row?.classList.contains('py-2')).toBe(true)
    expect(row?.classList.contains('text-sm')).toBe(true)
    expect(row?.classList.contains('last:border-b-0')).toBe(true)
  })
})