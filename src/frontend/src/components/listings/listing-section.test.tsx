import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingSection } from './listing-section'

describe('ListingSection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders section title and children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="Apartment description">
          <p>Bright room near the center.</p>
        </ListingSection>,
        container,
      )
    })

    const heading = container.querySelector('h2')
    const paragraph = container.querySelector('p')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Apartment description')
    expect(heading?.classList.contains('card-title')).toBe(true)
    expect(heading?.classList.contains('text-lg')).toBe(true)

    expect(paragraph).not.toBeNull()
    expect(paragraph?.textContent).toBe('Bright room near the center.')
  })

  it('renders content inside card body', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="Parameters">
          <span>2 rooms</span>
        </ListingSection>,
        container,
      )
    })

    const body = container.querySelector('.card-body')

    expect(body).not.toBeNull()
    expect(body?.classList.contains('gap-3')).toBe(true)
    expect(body?.textContent).toContain('Parameters')
    expect(body?.textContent).toContain('2 rooms')
  })

  it('passes custom class name to surface wrapper', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="Contact" className="mt-6">
          <p>Contact phone number</p>
        </ListingSection>,
        container,
      )
    })

    const section = container.querySelector('section')

    expect(section).not.toBeNull()
    expect(section?.classList.contains('card')).toBe(true)
    expect(section?.classList.contains('mt-6')).toBe(true)
  })

  it('supports dashed surface variant', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="No data" dashed>
          <p>Fill in the data later.</p>
        </ListingSection>,
        container,
      )
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('border-dashed')).toBe(true)
    expect(section?.classList.contains('border-solid')).toBe(false)
  })

  it('supports translucent surface variant', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="Information" translucent>
          <p>Additional information.</p>
        </ListingSection>,
        container,
      )
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('bg-base-100/75')).toBe(true)
    expect(section?.classList.contains('bg-base-100/85')).toBe(false)
  })
})