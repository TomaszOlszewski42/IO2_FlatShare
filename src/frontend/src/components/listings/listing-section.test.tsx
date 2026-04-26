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
        <ListingSection title="Opis mieszkania">
          <p>Jasny pokój blisko centrum.</p>
        </ListingSection>,
        container,
      )
    })

    const heading = container.querySelector('h2')
    const paragraph = container.querySelector('p')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Opis mieszkania')
    expect(heading?.classList.contains('card-title')).toBe(true)
    expect(heading?.classList.contains('text-lg')).toBe(true)

    expect(paragraph).not.toBeNull()
    expect(paragraph?.textContent).toBe('Jasny pokój blisko centrum.')
  })

  it('renders content inside card body', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="Parametry">
          <span>2 pokoje</span>
        </ListingSection>,
        container,
      )
    })

    const body = container.querySelector('.card-body')

    expect(body).not.toBeNull()
    expect(body?.classList.contains('gap-3')).toBe(true)
    expect(body?.textContent).toContain('Parametry')
    expect(body?.textContent).toContain('2 pokoje')
  })

  it('passes custom class name to surface wrapper', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingSection title="Kontakt" className="mt-6">
          <p>Telefon kontaktowy</p>
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
        <ListingSection title="Brak danych" dashed>
          <p>Uzupełnij dane później.</p>
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
        <ListingSection title="Informacje" translucent>
          <p>Dodatkowe informacje.</p>
        </ListingSection>,
        container,
      )
    })

    const section = container.querySelector('section')

    expect(section?.classList.contains('bg-base-100/75')).toBe(true)
    expect(section?.classList.contains('bg-base-100/85')).toBe(false)
  })
})