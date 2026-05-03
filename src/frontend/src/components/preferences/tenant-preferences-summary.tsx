import type { TenantPreferences } from '../../types/tenant-preferences'

type TenantPreferencesSummaryProps = {
  preferences: TenantPreferences
}

function formatBudget(maxPrice: number | null, currency: string): string {
  if (maxPrice === null) {
    return 'Not specified'
  }

  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      currencyDisplay: 'code',
      maximumFractionDigits: 0,
    }).format(maxPrice)
  } catch {
    return `${maxPrice} ${currency}`
  }
}

function formatBooleanPreference(value: boolean | null): string {
  if (value === true) {
    return 'Yes'
  }

  if (value === false) {
    return 'No'
  }

  return 'No preference'
}

function formatDistricts(value: string[]): string {
  if (value.length === 0) {
    return 'Not specified'
  }

  return value.join(', ')
}

function hasAnyPreferences(preferences: TenantPreferences): boolean {
  return (
    preferences.maxPrice !== null ||
    preferences.smokingAllowed !== null ||
    preferences.petsAllowed !== null ||
    preferences.preferredDistricts.length > 0
  )
}

export function TenantPreferencesSummary({ preferences }: TenantPreferencesSummaryProps) {
  const hasPreferences = hasAnyPreferences(preferences)

  return (
    <div class="card mb-6 border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body gap-4">
        <div>
          <h2 class="text-lg font-semibold">Current preferences</h2>
          <p class="text-sm text-base-content/70">
            This shortcut shows what data will later be used to match apartments.
          </p>
        </div>

        {!hasPreferences ? (
          <div class="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-4 text-sm text-base-content/70">
            No tenant preferences have been set yet.
          </div>
        ) : (
          <div class="rounded-box border border-base-300/70 bg-base-100 px-4">
            <div class="flex items-center justify-between border-b border-base-300/70 py-3 text-sm">
              <span class="text-base-content/70">Maximum budget</span>
              <span class="font-medium text-base-content">
                {formatBudget(preferences.maxPrice, preferences.currency)}
              </span>
            </div>

            <div class="flex items-center justify-between border-b border-base-300/70 py-3 text-sm">
              <span class="text-base-content/70">Smoking</span>
              <span class="font-medium text-base-content">
                {formatBooleanPreference(preferences.smokingAllowed)}
              </span>
            </div>

            <div class="flex items-center justify-between border-b border-base-300/70 py-3 text-sm">
              <span class="text-base-content/70">Pets</span>
              <span class="font-medium text-base-content">
                {formatBooleanPreference(preferences.petsAllowed)}
              </span>
            </div>

            <div class="flex items-start justify-between gap-6 py-3 text-sm">
              <span class="pt-0.5 text-base-content/70">Preferred districts</span>
              <span class="max-w-[60%] text-right font-medium text-base-content">
                {formatDistricts(preferences.preferredDistricts)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}