import type { TenantPreferences } from '../types/tenant-preferences'

const TENANT_PREFERENCES_DRAFT_STORAGE_KEY = 'flatshare.tenant-preferences-draft'

type TenantPreferencesDraftRecord = {
  values: TenantPreferences
  updatedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeBooleanOrNull(value: unknown): boolean | null {
  if (value === true) {
    return true
  }

  if (value === false) {
    return false
  }

  return null
}

function normalizeNumberOrNull(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  const uniqueValues = new Set<string>()

  value.forEach((item) => {
    if (typeof item === 'string') {
      const normalizedItem = item.trim()

      if (normalizedItem.length > 0) {
        uniqueValues.add(normalizedItem)
      }
    }
  })

  return Array.from(uniqueValues)
}

function normalizeTenantPreferences(value: unknown): TenantPreferences | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    maxPrice: normalizeNumberOrNull(value.maxPrice),
    currency: 'PLN',
    smokingAllowed: normalizeBooleanOrNull(value.smokingAllowed),
    petsAllowed: normalizeBooleanOrNull(value.petsAllowed),
    preferredDistricts: normalizeStringArray(value.preferredDistricts),
  }
}

export function readTenantPreferencesDraft(): TenantPreferencesDraftRecord | null {
  try {
    const rawValue = localStorage.getItem(TENANT_PREFERENCES_DRAFT_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    const parsedValue = JSON.parse(rawValue)

    if (!isRecord(parsedValue)) {
      return null
    }

    const normalizedValues = normalizeTenantPreferences(parsedValue.values)

    if (!normalizedValues) {
      return null
    }

    return {
      values: normalizedValues,
      updatedAt: typeof parsedValue.updatedAt === 'string' ? parsedValue.updatedAt : new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function saveTenantPreferencesDraft(values: TenantPreferences): string | null {
  try {
    const updatedAt = new Date().toISOString()

    localStorage.setItem(
      TENANT_PREFERENCES_DRAFT_STORAGE_KEY,
      JSON.stringify({
        values,
        updatedAt,
      }),
    )

    return updatedAt
  } catch {
    return null
  }
}

export function clearTenantPreferencesDraft(): void {
  try {
    localStorage.removeItem(TENANT_PREFERENCES_DRAFT_STORAGE_KEY)
  } catch {
    // Ignore localStorage error.
  }
}