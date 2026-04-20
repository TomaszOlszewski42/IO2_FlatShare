import { useEffect, useMemo, useState } from 'preact/hooks'

import { AppButton } from '../ui/app-button'
import { NumberInput } from '../ui/number-input'
import { SelectInput } from '../ui/select-input'
import { TextInput } from '../ui/text-input'
import type { TenantPreferences } from '../../types/tenant-preferences'

type TenantPreferencesFormProps = {
  initialValues: TenantPreferences
  isSubmitting?: boolean
  onSubmit: (values: TenantPreferences) => void | Promise<void>
  submitLabel?: string
  saveMessage?: string | null
}

type BooleanPreferenceValue = 'null' | 'true' | 'false'

function toBooleanPreferenceValue(value: boolean | null): BooleanPreferenceValue {
  if (value === true) {
    return 'true'
  }

  if (value === false) {
    return 'false'
  }

  return 'null'
}

function fromBooleanPreferenceValue(value: string): boolean | null {
  if (value === 'true') {
    return true
  }

  if (value === 'false') {
    return false
  }

  return null
}

function districtsToInputValue(districts: string[]): string {
  return districts.join(', ')
}

function parseDistricts(value: string): string[] {
  return value
    .split(',')
    .map((district) => district.trim())
    .filter((district) => district.length > 0)
}

export function TenantPreferencesForm({
  initialValues,
  isSubmitting = false,
  onSubmit,
  submitLabel = 'Save preferences',
  saveMessage = null,
}: TenantPreferencesFormProps) {
  const [maxPrice, setMaxPrice] = useState<number | ''>(initialValues.maxPrice ?? '')
  const [currency, setCurrency] = useState(initialValues.currency)
  const [smokingAllowed, setSmokingAllowed] = useState<BooleanPreferenceValue>(
    toBooleanPreferenceValue(initialValues.smokingAllowed),
  )
  const [petsAllowed, setPetsAllowed] = useState<BooleanPreferenceValue>(
    toBooleanPreferenceValue(initialValues.petsAllowed),
  )
  const [preferredDistricts, setPreferredDistricts] = useState(districtsToInputValue(initialValues.preferredDistricts))

  useEffect(() => {
    setMaxPrice(initialValues.maxPrice ?? '')
    setCurrency(initialValues.currency)
    setSmokingAllowed(toBooleanPreferenceValue(initialValues.smokingAllowed))
    setPetsAllowed(toBooleanPreferenceValue(initialValues.petsAllowed))
    setPreferredDistricts(districtsToInputValue(initialValues.preferredDistricts))
  }, [initialValues])

  const normalizedValues = useMemo<TenantPreferences>(
    () => ({
      maxPrice: maxPrice === '' ? null : maxPrice,
      currency,
      smokingAllowed: fromBooleanPreferenceValue(smokingAllowed),
      petsAllowed: fromBooleanPreferenceValue(petsAllowed),
      preferredDistricts: parseDistricts(preferredDistricts),
    }),
    [currency, maxPrice, petsAllowed, preferredDistricts, smokingAllowed],
  )

  function handleSubmit(event: SubmitEvent) {
    event.preventDefault()
    void onSubmit(normalizedValues)
  }

  return (
    <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div class="grid gap-4 md:grid-cols-2">
        <NumberInput
          id="tenant-preferences-max-price"
          name="maxPrice"
          label="Maximum monthly price"
          value={maxPrice}
          min={0}
          step={50}
          placeholder="1500"
          disabled={isSubmitting}
          onInput={(event) => {
            const value = (event.currentTarget as HTMLInputElement).value
            setMaxPrice(value === '' ? '' : Number(value))
          }}
        />

        <SelectInput
          id="tenant-preferences-currency"
          name="currency"
          label="Currency"
          value={currency}
          disabled={isSubmitting}
          onChange={(event) => {
            const target = event.currentTarget as HTMLSelectElement
            setCurrency(target.value === 'PLN' ? 'PLN' : 'PLN')
          }}
          options={[{ value: 'PLN', label: 'PLN' }]}
        />
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <SelectInput
          id="tenant-preferences-smoking"
          name="smokingAllowed"
          label="Smoking"
          value={smokingAllowed}
          disabled={isSubmitting}
          onChange={(event) => {
            const target = event.currentTarget as HTMLSelectElement
            setSmokingAllowed(target.value as BooleanPreferenceValue)
          }}
          options={[
            { value: 'null', label: 'No preference' },
            { value: 'true', label: 'Allowed' },
            { value: 'false', label: 'Not allowed' },
          ]}
        />

        <SelectInput
          id="tenant-preferences-pets"
          name="petsAllowed"
          label="Pets"
          value={petsAllowed}
          disabled={isSubmitting}
          onChange={(event) => {
            const target = event.currentTarget as HTMLSelectElement
            setPetsAllowed(target.value as BooleanPreferenceValue)
          }}
          options={[
            { value: 'null', label: 'No preference' },
            { value: 'true', label: 'Allowed' },
            { value: 'false', label: 'Not allowed' },
          ]}
        />
      </div>

      <TextInput
        id="tenant-preferences-districts"
        name="preferredDistricts"
        label="Preferred districts"
        value={preferredDistricts}
        placeholder="Mokotów, Ochota, Wola"
        disabled={isSubmitting}
        onInput={(event) => setPreferredDistricts((event.currentTarget as HTMLInputElement).value)}
      />

      <div class="text-sm text-base-content/70">
        Enter districts as a comma-separated list. You can leave any field empty if you do not have a preference yet.
      </div>

      {saveMessage ? <div class="alert alert-success text-sm">{saveMessage}</div> : null}

      <div class="flex justify-end">
        <AppButton type="submit" loading={isSubmitting}>
          {submitLabel}
        </AppButton>
      </div>
    </form>
  )
}