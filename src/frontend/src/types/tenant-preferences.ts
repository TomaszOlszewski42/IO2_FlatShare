// Model domenowy preferencji lokatora po stronie frontendu

export const tenantPreferenceCurrencies = ['PLN'] as const

export type TenantPreferenceCurrency = (typeof tenantPreferenceCurrencies)[number]

export type TenantPreferences = {
  maxPrice: number | null
  currency: TenantPreferenceCurrency
  smokingAllowed: boolean | null
  petsAllowed: boolean | null
  preferredDistricts: string[]
}

export function createEmptyTenantPreferences(): TenantPreferences {
  return {
    maxPrice: null,
    currency: 'PLN',
    smokingAllowed: null,
    petsAllowed: null,
    preferredDistricts: [],
  }
}