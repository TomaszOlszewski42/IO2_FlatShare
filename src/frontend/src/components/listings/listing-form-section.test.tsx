import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import { ListingFormSection } from './listing-form-section'

describe('ListingFormSection', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders section title, description and children', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFormSection
          title="Podstawowe informacje"
          description="Uzupełnij tytuł i opis ogłoszenia."
        >
          <input name="title" />
        </ListingFormSection>,
        container,
      )
    })

    const heading = container.querySelector('h2')
    const description = container.querySelector('p')
    const input = container.querySelector('input[name="title"]')

    expect(heading).not.toBeNull()
    expect(heading?.textContent).toBe('Podstawowe informacje')
    expect(heading?.classList.contains('text-xl')).toBe(true)
    expect(heading?.classList.contains('font-semibold')).toBe(true)

    expect(description).not.toBeNull()
    expect(description?.textContent).toBe('Uzupełnij tytuł i opis ogłoszenia.')
    expect(description?.classList.contains('text-sm')).toBe(true)

    expect(input).not.toBeNull()
  })

  it('renders default layout classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFormSection title="Cena" description="Podaj koszty najmu.">
          <div>Formularz</div>
        </ListingFormSection>,
        container,
      )
    })

    const wrapper = container.firstElementChild

    expect(wrapper).not.toBeNull()
    expect(wrapper?.classList.contains('space-y-6')).toBe(true)
    expect(wrapper?.classList.contains('card-body')).toBe(true)
  })

  it('appends custom class name', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFormSection
          title="Lokalizacja"
          description="Podaj adres mieszkania."
          className="border-t"
        >
          <div>Adres</div>
        </ListingFormSection>,
        container,
      )
    })

    const wrapper = container.firstElementChild

    expect(wrapper?.classList.contains('space-y-6')).toBe(true)
    expect(wrapper?.classList.contains('card-body')).toBe(true)
    expect(wrapper?.classList.contains('border-t')).toBe(true)
  })
})