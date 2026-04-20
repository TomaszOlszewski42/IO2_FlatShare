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
        <h2 class="text-xl font-semibold">Wymagania wobec lokatora</h2>
        <p class="text-sm text-base-content/65">
          Określ, jaki profil lokatora jest dla Ciebie najbardziej odpowiedni.
        </p>
      </div>

      <div class="alert alert-info text-sm">
        <span>
          Ta sekcja opisuje preferencje właściciela wobec lokatora. To nie to samo co cechy mieszkania, które ustawiasz
          wyżej.
        </span>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CheckboxInput
          id="tenant-requirements-pets-allowed"
          name="petsAllowed"
          label="Akceptuję lokatora ze zwierzęciem"
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
          label="Szukam osoby niepalącej"
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
        label="Preferowany profil lokatora"
        value={formData.preferredTenantProfile}
        error={errors.preferredTenantProfile}
        disabled={disabled}
        placeholder="Brak preferencji"
        onChange={(event) => {
          const value = (event.currentTarget as HTMLSelectElement).value
          onUpdate('preferredTenantProfile', value)
        }}
        options={[
          { value: 'student', label: 'Student' },
          { value: 'working', label: 'Osoba pracująca' },
        ]}
      />

      {/* TODO BACKEND:
          Wpiąć te pola do Listing.attributes lub równoważnego kontraktu po stronie API.
          Frontend zakłada obecnie:
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