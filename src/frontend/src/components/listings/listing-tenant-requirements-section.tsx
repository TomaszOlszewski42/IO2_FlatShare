import { CheckboxInput } from '../ui/checkbox-input'
import { SelectInput } from '../ui/select-input'

type ListingTenantRequirementsFormData = {
  petsAllowed: boolean
  nonSmokingOnly: boolean
  preferredTenantProfile: string
}

type ListingTenantRequirementsSectionProps = {
  formData: ListingTenantRequirementsFormData
  errors: Partial<Record<keyof ListingTenantRequirementsFormData, string>>
  disabled?: boolean
  onUpdate: <K extends keyof ListingTenantRequirementsFormData>(
    field: K,
    value: ListingTenantRequirementsFormData[K],
  ) => void
}

export function ListingTenantRequirementsSection({
  formData,
  errors,
  disabled = false,
  onUpdate,
}: ListingTenantRequirementsSectionProps) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Tenant requirements</h2>
        <p class="text-sm text-base-content/65">
          Specify what tenant profile is most suitable for you.
        </p>
      </div>

      <div class="alert alert-info text-sm">
        <span>
          This section describes the landlord's preferences towards the tenant. This is not the same as the apartment features you set
          above.
        </span>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CheckboxInput
          id="tenant-requirements-pets-allowed"
          name="petsAllowed"
          label="I accept tenants with pets"
          checked={formData.petsAllowed}
          disabled={disabled}
          error={errors.petsAllowed}
          onChange={(event) => {
            const value = (event.currentTarget as HTMLInputElement).checked
            onUpdate('petsAllowed', value)
          }}
        />

        <CheckboxInput
          id="tenant-requirements-non-smoking-only"
          name="nonSmokingOnly"
          label="Looking for a non-smoker"
          checked={formData.nonSmokingOnly}
          disabled={disabled}
          error={errors.nonSmokingOnly}
          onChange={(event) => {
            const value = (event.currentTarget as HTMLInputElement).checked
            onUpdate('nonSmokingOnly', value)
          }}
        />
      </div>

      <SelectInput
        id="tenant-requirements-profile"
        name="preferredTenantProfile"
        label="Preferred tenant profile"
        value={formData.preferredTenantProfile}
        error={errors.preferredTenantProfile}
        disabled={disabled}
        placeholder="No preferences"
        onChange={(event) => {
          const value = (event.currentTarget as HTMLSelectElement).value
          onUpdate('preferredTenantProfile', value)
        }}
        options={[
          { value: 'student', label: 'Student' },
          { value: 'working', label: 'Working person' },
        ]}
      />

      {/* TODO BACKEND:
          Connect these fields to Listing.attributes or an equivalent contract on the API side.
          Frontend currently assumes:
          - petsAllowed: boolean
          - nonSmokingOnly: boolean
          - preferredTenantProfile: string | null
      */}
      <div class="text-sm text-base-content/70">
        Na tym etapie frontend zbiera te dane, ale backend jeszcze ich nie zapisuje.
      </div>
    </div>
  )
}