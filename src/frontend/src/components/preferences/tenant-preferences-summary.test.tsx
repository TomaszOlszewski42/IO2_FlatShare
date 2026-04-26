import { afterEach, describe, expect, it } from 'vitest'
import { render } from 'preact'
import { act } from 'preact/test-utils'

import type { TenantPreferences } from '../../types/tenant-preferences'
import { TenantPreferencesSummary } from './tenant-preferences-summary'

describe('TenantPreferencesSummary', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renders empty preferences message when no preferences are set', () => {
    const preferences: TenantPreferences = {
      maxPrice: null,
      currency: 'PLN',
      smokingAllowed: null,
      petsAllowed: null,
      preferredDistricts: [],
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<TenantPreferencesSummary preferences={preferences} />, container)
    })

    expect(container.textContent).toContain('Aktualne preferencje')
    expect(container.textContent).toContain('Nie ustawiono jeszcze żadnych preferencji lokatora.')
  })

  it('renders configured preferences summary', () => {
    const preferences: TenantPreferences = {
      maxPrice: 1500,
      currency: 'PLN',
      smokingAllowed: false,
      petsAllowed: true,
      preferredDistricts: ['Mokotów', 'Wola'],
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<TenantPreferencesSummary preferences={preferences} />, container)
    })

    const text = container.textContent?.replace(/\u00a0/g, ' ') ?? ''

    expect(text).toContain('Maksymalny budżet')
    expect(text).toMatch(/1\s*500\s*zł/)
    expect(text).toContain('Palenie')
    expect(text).toContain('Nie')
    expect(text).toContain('Zwierzęta')
    expect(text).toContain('Tak')
    expect(text).toContain('Preferowane dzielnice')
    expect(text).toContain('Mokotów, Wola')
  })

  it('renders no preference labels for nullable boolean values', () => {
    const preferences: TenantPreferences = {
      maxPrice: 1000,
      currency: 'PLN',
      smokingAllowed: null,
      petsAllowed: null,
      preferredDistricts: [],
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<TenantPreferencesSummary preferences={preferences} />, container)
    })

    expect(container.textContent).toContain('Bez preferencji')
    expect(container.textContent).toContain('Nie określono')
  })
})