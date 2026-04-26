import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingsSurface } from './listings-surface'

describe('ListingsSurface', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders children inside a section', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingsSurface>
          <p>Treść sekcji</p>
        </ListingsSurface>,
        container,
      )
    })

    const section = container.querySelector('section')
    const paragraph = container.querySelector('p')

    expect(section).not.toBeNull()
    expect(paragraph?.textContent).toBe('Treść sekcji')
  })

  it('uses default solid border and background classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSurface>Treść</ListingsSurface>, container)
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('card')).toBe(true)
    expect(section?.classList.contains('border')).toBe(true)
    expect(section?.classList.contains('border-solid')).toBe(true)
    expect(section?.classList.contains('border-base-300')).toBe(true)
    expect(section?.classList.contains('bg-base-100/85')).toBe(true)
    expect(section?.classList.contains('shadow-sm')).toBe(true)
  })

  it('supports dashed border', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSurface dashed>Treść</ListingsSurface>, container)
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('border-dashed')).toBe(true)
    expect(section?.classList.contains('border-solid')).toBe(false)
  })

  it('supports translucent background', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSurface translucent>Treść</ListingsSurface>, container)
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('bg-base-100/75')).toBe(true)
    expect(section?.classList.contains('bg-base-100/85')).toBe(false)
  })

  it('appends custom class name', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<ListingsSurface className="mt-4">Treść</ListingsSurface>, container)
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('card')).toBe(true)
    expect(section?.classList.contains('mt-4')).toBe(true)
  })
})