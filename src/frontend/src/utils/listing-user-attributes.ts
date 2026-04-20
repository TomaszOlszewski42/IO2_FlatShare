import type { ListingAttributes } from '../types/listing'

export type AttributePresentation = {
  label: string
  tone: string
}

export function formatPreferredTenantProfileLabel(value?: string | null): string | null {
  if (!value) {
    return null
  }

  if (value === 'student') {
    return 'Student'
  }

  if (value === 'working') {
    return 'Osoba pracująca'
  }

  return value
}

export function formatPetsAllowedPresentation(value?: boolean): AttributePresentation {
  if (value === true) {
    return { label: 'Tak', tone: 'text-success' }
  }

  if (value === false) {
    return { label: 'Nie', tone: 'text-error' }
  }

  return { label: 'Nie określono', tone: 'text-base-content/60' }
}

export function formatSmokingRequirementPresentation(nonSmokingOnly?: boolean): AttributePresentation {
  if (nonSmokingOnly === true) {
    return { label: 'Niedozwolone', tone: 'text-error' }
  }

  if (nonSmokingOnly === false) {
    return { label: 'Dozwolone', tone: 'text-success' }
  }

  return { label: 'Nie określono', tone: 'text-base-content/60' }
}

export function getListingUserAttributeBadges(attributes?: ListingAttributes): string[] {
  const badges: string[] = []

  if (attributes?.petsAllowed === true) {
    badges.push('Akceptowane zwierzęta')
  } else if (attributes?.petsAllowed === false) {
    badges.push('Bez zwierząt')
  }

  if (attributes?.nonSmokingOnly === true) {
    badges.push('Tylko niepalący')
  }

  const preferredTenantProfile = formatPreferredTenantProfileLabel(attributes?.preferredTenantProfile)

  if (preferredTenantProfile) {
    badges.push(preferredTenantProfile)
  }

  return badges
}