import { apiRequest } from './api-client'
import { readAuthSession } from './auth-session'
import { createEmptyTenantPreferences, type TenantPreferences } from '../types/tenant-preferences'

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

function getAuthHeaders(): Record<string, string> {
  const session = readAuthSession()

  if (!session) {
    throw new Error('Brak aktywnej sesji użytkownika.')
  }

  return {
    Authorization: `${session.type} ${session.token}`,
  }
}

export async function getTenantPreferences(): Promise<TenantPreferences> {
  const response = await apiRequest<unknown>('/users/me/preferences', {
    method: 'GET',
    headers: getAuthHeaders(),
  })

  return normalizeTenantPreferences(response)
}

export async function updateTenantPreferences(preferences: TenantPreferences): Promise<TenantPreferences> {
  const normalizedPreferences = normalizeTenantPreferences(preferences)

  await apiRequest<void>('/users/me/preferences', {
    method: 'PUT',
    body: normalizedPreferences,
    headers: getAuthHeaders(),
  })

  // Backend zwraca 204 No Content, więc po zapisie dociągamy aktualny stan.
  return getTenantPreferences()
}