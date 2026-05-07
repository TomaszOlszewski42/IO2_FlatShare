import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import type { Listing } from '../../types/listing'
import { ListingTenantContactPanel } from './listing-tenant-contact-panel'

const baseListing: Listing = {
  id: 'listing-1',
  ownerId: 'owner-1',
  title: 'Bright room near the center',
  description: 'Cozy room in a well-connected location.',
  price: 1500,
  currency: 'PLN',
  location: {
    city: 'Warsaw',
  },
  contact: 'Anna Owner',
  contactEmail: 'anna.owner@example.com',
  contactPhone: '+48123456789',
}

function renderPanel(listing: Listing) {
  const container = document.createElement('div')
  document.body.appendChild(container)

  act(() => {
    render(<ListingTenantContactPanel listing={listing} />, container)
  })

  return container
}

describe('ListingTenantContactPanel', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders owner contact information', () => {
    const container = renderPanel(baseListing)

    expect(container.textContent).toContain('Interested in this offer?')
    expect(container.textContent).toContain('Anna Owner')
    expect(container.textContent).toContain('+48123456789')
    expect(container.textContent).toContain('anna.owner@example.com')
  })

  it('renders public owner profile link when owner id is available', () => {
    const container = renderPanel(baseListing)

    const profileLink = Array.from(container.querySelectorAll('a')).find(
      (link) => link.textContent === 'Owner profile',
    )

    expect(profileLink).not.toBeUndefined()
    expect(profileLink?.getAttribute('href')).toBe('/users/owner-1')
  })

  it('renders disabled owner profile action when owner id is missing', () => {
    const listingWithoutOwnerId: Listing = {
      ...baseListing,
      ownerId: undefined,
    }

    const container = renderPanel(listingWithoutOwnerId)

    const disabledProfileButton = Array.from(container.querySelectorAll('button')).find(
      (button) => button.textContent === 'Owner profile unavailable',
    )

    expect(container.textContent).toContain('Owner profile unavailable')
    expect(container.textContent).toContain('Owner profile link will become available when this listing includes the owner id.')
    expect(disabledProfileButton).not.toBeUndefined()
    expect(disabledProfileButton?.disabled).toBe(true)
    expect(container.querySelector('a[href^="/users/"]')).toBeNull()
  })

  it('renders direct contact fallback when phone and email are missing', () => {
    const listingWithoutContactData: Listing = {
      ...baseListing,
      contactEmail: null,
      contactPhone: null,
      phone: null,
    }

    const container = renderPanel(listingWithoutContactData)

    expect(container.textContent).toContain('Direct contact details are not available for this listing yet.')
  })
})