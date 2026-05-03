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

    expect(container.textContent).toContain('Current preferences')
    expect(container.textContent).toContain('No tenant preferences have been set yet.')
  })

  it('renders configured preferences summary', () => {
    const preferences: TenantPreferences = {
      maxPrice: 1500,
      currency: 'PLN',
      smokingAllowed: false,
      petsAllowed: true,
      preferredDistricts: ['Mokotow', 'Wola'],
    }

    const container = document.createElement('div')
    document.body.appendChild(container)

    act(() => {
      render(<TenantPreferencesSummary preferences={preferences} />, container)
    })

    const text = container.textContent?.replace(/\u00a0/g, ' ') ?? ''

    expect(text).toContain('Maximum budget')
    expect(text).toMatch(/PLN\s*1[,\s]500/)
    expect(text).toContain('Smoking')
    expect(text).toContain('No')
    expect(text).toContain('Pets')
    expect(text).toContain('Yes')
    expect(text).toContain('Preferred districts')
    expect(text).toContain('Mokotow, Wola')
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

    expect(container.textContent).toContain('No preference')
    expect(container.textContent).toContain('Not specified')
  })
})