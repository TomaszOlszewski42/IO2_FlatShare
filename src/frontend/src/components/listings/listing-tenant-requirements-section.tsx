import { CheckboxInput } from '../ui/checkbox-input'
import { SelectInput } from '../ui/select-input'

type ListingTenantRequirementsSectionProps = {
  formData: {
    petsAllowed: boolean
    nonSmokingOnly: boolean
    preferredTenantProfile: string
  }
  errors: Partial<Record<'petsAllowed' | 'nonSmokingOnly' | 'preferredTenantProfile', string>>
  onUpdate: <K extends keyof ListingTenantRequirementsSectionProps['formData']>(
    field: K,
    value: ListingTenantRequirementsSectionProps['formData'][K],
  ) => void
}

export function ListingTenantRequirementsSection({
  formData,
  errors,
  onUpdate,
}: ListingTenantRequirementsSectionProps) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Wymagania wobec lokatora</h2>
        <p class="text-sm text-base-content/65">
          Te pola opisują, dla jakiego typu lokatora ogłoszenie jest najbardziej odpowiednie.
        </p>
      </div>

      {/* TODO BACKEND:
          Wpiąć te pola do Listing.attributes lub równoważnego kontraktu po stronie API.
          Frontend zakłada obecnie:
          - petsAllowed: boolean
          - nonSmokingOnly: boolean
          - preferredTenantProfile: string | null
      */}

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CheckboxInput
          id="petsAllowed"
          name="petsAllowed"
          label="Zwierzęta dozwolone"
          checked={formData.petsAllowed}
          error={errors.petsAllowed}
          onChange={(event) => {
            const value = (event.currentTarget as HTMLInputElement).checked
            onUpdate('petsAllowed', value)
          }}
        />

        <CheckboxInput
          id="nonSmokingOnly"
          name="nonSmokingOnly"
          label="Tylko osoby niepalące"
          checked={formData.nonSmokingOnly}
          error={errors.nonSmokingOnly}
          onChange={(event) => {
            const value = (event.currentTarget as HTMLInputElement).checked
            onUpdate('nonSmokingOnly', value)
          }}
        />
      </div>

      <SelectInput
        id="preferredTenantProfile"
        name="preferredTenantProfile"
        label="Preferowany profil lokatora"
        value={formData.preferredTenantProfile}
        error={errors.preferredTenantProfile}
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

      {/* TODO BACKEND: DELETE ME */}
      <div class="alert alert-info text-sm">
        <span>
          Na tym etapie frontend zbiera te dane, ale aktualny backend jeszcze ich nie zapisuje. To przygotowanie pod
          przyszłe podpięcie API.
        </span>
      </div>
    </div>
  )
}