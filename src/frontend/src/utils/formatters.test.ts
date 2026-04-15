import { describe, expect, it } from 'vitest'

import { formatArea } from './format-area'
import { formatLocation } from './format-location'

describe('utils formatters', () => {
  it('formats area for integers and decimals', () => {
    expect(formatArea(30)).toBe('30 m2')
    expect(formatArea(30.4)).toBe('30,4 m2')
  })

  it('formats location and falls back to dash for empty values', () => {
    expect(
      formatLocation({
        city: 'Warsaw',
        district: 'Mokotow',
        street: 'Pulawska',
        aptNumber: '10A',
        postalCode: '02-515',
      }),
    ).toBe('Warsaw, Mokotow, Pulawska 10A, 02-515')

    expect(
      formatLocation({
        city: '',
      }),
    ).toBe('-')
  })
})
