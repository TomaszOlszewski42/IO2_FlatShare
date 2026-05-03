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
    return 'Working person'
  }

  return value
}

export function formatPetsAllowedPresentation(value?: boolean): AttributePresentation {
  if (value === true) {
    return { label: 'Yes', tone: 'text-success' }
  }

  if (value === false) {
    return { label: 'No', tone: 'text-error' }
  }

  return { label: 'Not specified', tone: 'text-base-content/60' }
}

export function formatSmokingRequirementPresentation(nonSmokingOnly?: boolean): AttributePresentation {
  if (nonSmokingOnly === true) {
    return { label: 'Not allowed', tone: 'text-error' }
  }

  if (nonSmokingOnly === false) {
    return { label: 'Allowed', tone: 'text-success' }
  }

  return { label: 'Not specified', tone: 'text-base-content/60' }
}

export function getListingUserAttributeBadges(attributes?: ListingAttributes): string[] {
  const badges: string[] = []

  if (attributes?.petsAllowed === true) {
    badges.push('Pets allowed')
  } else if (attributes?.petsAllowed === false) {
    badges.push('No pets')
  }

  if (attributes?.nonSmokingOnly === true) {
    badges.push('Non-smokers only')
  }

  const preferredTenantProfile = formatPreferredTenantProfileLabel(attributes?.preferredTenantProfile)

  if (preferredTenantProfile) {
    badges.push(preferredTenantProfile)
  }

  return badges
}