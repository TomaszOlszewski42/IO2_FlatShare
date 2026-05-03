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
          title="Basic information"
          description="Fill out the title and description of the listing."
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
    expect(heading?.textContent).toBe('Basic information')
    expect(heading?.classList.contains('text-xl')).toBe(true)
    expect(heading?.classList.contains('font-semibold')).toBe(true)

    expect(description).not.toBeNull()
    expect(description?.textContent).toBe('Fill out the title and description of the listing.')
    expect(description?.classList.contains('text-sm')).toBe(true)

    expect(input).not.toBeNull()
  })

  it('renders default layout classes', () => {
    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(
        <ListingFormSection title="Price" description="Enter rental costs.">
          <div>Form</div>
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
          title="Location"
          description="Enter the apartment address."
          className="border-t"
        >
          <div>Address</div>
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