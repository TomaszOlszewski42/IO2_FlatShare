import type { ListingFormData } from '../components/listings/listing-create-form'

const LISTING_CREATE_DRAFT_STORAGE_KEY = 'flatshare.listing-create-draft'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function normalizeNumber(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function normalizePositiveInteger(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback
  }

  const normalizedValue = Math.trunc(value)
  return normalizedValue >= 1 ? normalizedValue : fallback
}

function normalizeBoolean(value: unknown): boolean {
  return value === true
}

function normalizePublicationStatus(value: unknown): 'draft' | 'active' {
  return value === 'active' ? 'active' : 'draft'
}

function normalizeDate(value: unknown): string {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value
  }

  return new Date().toISOString().split('T')[0]
}

function normalizeListingCreateDraft(value: unknown): Partial<ListingFormData> | null {
  if (!isRecord(value)) {
    return null
  }

  return {
    title: normalizeString(value.title),
    description: normalizeString(value.description),
    pricePerMonth: normalizeNumber(value.pricePerMonth, 0),
    areaSqm: normalizeNumber(value.areaSqm, 0),
    rooms: normalizePositiveInteger(value.rooms, 1),
    bathrooms: normalizePositiveInteger(value.bathrooms, 1),
    availableFrom: normalizeDate(value.availableFrom),
    city: normalizeString(value.city),
    district: normalizeString(value.district),
    street: normalizeString(value.street),
    buildingNumber: normalizeString(value.buildingNumber),
    postalCode: normalizeString(value.postalCode),
    contact: normalizeString(value.contact),
    phone: normalizeString(value.phone),
    allowPets: normalizeBoolean(value.allowPets),
    allowSmoking: normalizeBoolean(value.allowSmoking),
    furnished: normalizeBoolean(value.furnished),
    petsAllowed: normalizeBoolean(value.petsAllowed),
    nonSmokingOnly: normalizeBoolean(value.nonSmokingOnly),
    preferredTenantProfile: normalizeString(value.preferredTenantProfile),
    publicationStatus: normalizePublicationStatus(value.publicationStatus),
  }
}

export function readListingCreateDraft(): Partial<ListingFormData> | null {
  try {
    const rawValue = localStorage.getItem(LISTING_CREATE_DRAFT_STORAGE_KEY)

    if (!rawValue) {
      return null
    }

    return normalizeListingCreateDraft(JSON.parse(rawValue))
  } catch {
    return null
  }
}

export function saveListingCreateDraft(formData: ListingFormData): void {
  try {
    localStorage.setItem(LISTING_CREATE_DRAFT_STORAGE_KEY, JSON.stringify(formData))
  } catch {
    // Ignorujemy błąd zapisu localStorage.
  }
}

export function clearListingCreateDraft(): void {
  try {
    localStorage.removeItem(LISTING_CREATE_DRAFT_STORAGE_KEY)
  } catch {
    // Ignorujemy błąd usuwania localStorage.
  }
}