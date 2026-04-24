// Serwis danych dla preferencji lokatora, pobiera i zapisuje dane w localStorage
// Czyści i normalizuje dane, żeby frontend nie psuł się przy złym formacie

import { createEmptyTenantPreferences, type TenantPreferences } from '../types/tenant-preferences'

const TENANT_PREFERENCES_STORAGE_KEY = 'flatshare.tenant-preferences'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizePreferredDistricts(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .filter((district): district is string => typeof district === 'string')
    .map((district) => district.trim())
    .filter((district) => district.length > 0)
}

function normalizeNullableBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') {
    return value
  }

  return null
}

function normalizeNullableNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
    return value
  }

  return null
}

function normalizeTenantPreferences(value: unknown): TenantPreferences {
  const empty = createEmptyTenantPreferences()

  if (!isRecord(value)) {
    return empty
  }

  return {
    maxPrice: normalizeNullableNumber(value.maxPrice),
    currency: value.currency === 'PLN' ? 'PLN' : empty.currency,
    smokingAllowed: normalizeNullableBoolean(value.smokingAllowed),
    petsAllowed: normalizeNullableBoolean(value.petsAllowed),
    preferredDistricts: normalizePreferredDistricts(value.preferredDistricts),
  }
}

function readTenantPreferencesFromStorage(): TenantPreferences {
  const rawValue = localStorage.getItem(TENANT_PREFERENCES_STORAGE_KEY)

  if (!rawValue) {
    return createEmptyTenantPreferences()
  }

  try {
    return normalizeTenantPreferences(JSON.parse(rawValue))
  } catch {
    return createEmptyTenantPreferences()
  }
}

function writeTenantPreferencesToStorage(preferences: TenantPreferences) {
  localStorage.setItem(TENANT_PREFERENCES_STORAGE_KEY, JSON.stringify(preferences))
}

/*
TODO BACKEND:
- GET /api/v1/users/me/preferences
- odpowiedź zgodna z TenantPreferences
*/
export async function getTenantPreferences(): Promise<TenantPreferences> {
  return readTenantPreferencesFromStorage()
}

/*
TODO BACKEND:
- PUT /api/v1/users/me/preferences
- body zgodne z TenantPreferences
- odpowiedź zgodna z TenantPreferences
*/
export async function updateTenantPreferences(preferences: TenantPreferences): Promise<TenantPreferences> {
  const normalizedPreferences = normalizeTenantPreferences(preferences)

  writeTenantPreferencesToStorage(normalizedPreferences)

  return normalizedPreferences
}