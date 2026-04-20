import type { JSX } from 'preact'
import { useEffect, useMemo, useState } from 'preact/hooks'

import { AppButton } from '../ui/app-button'
import { NumberInput } from '../ui/number-input'
import { SelectInput } from '../ui/select-input'
import { TextInput } from '../ui/text-input'
import type { TenantPreferences } from '../../types/tenant-preferences'

type TenantPreferencesFormProps = {
  initialValues: TenantPreferences
  isSubmitting?: boolean
  onChange?: (values: TenantPreferences) => void
  onSubmit: (values: TenantPreferences) => void | Promise<void>
  submitLabel?: string
  saveMessage?: string | null
}

type BooleanPreferenceValue = 'null' | 'true' | 'false'

type FormErrors = {
  maxPrice?: string
}

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
  const uniqueDistricts = new Set<string>()

  value
    .split(',')
    .map((district) => district.trim())
    .filter((district) => district.length > 0)
    .forEach((district) => uniqueDistricts.add(district))

  return Array.from(uniqueDistricts)
}

export function TenantPreferencesForm({
  initialValues,
  isSubmitting = false,
  onChange,
  onSubmit,
  submitLabel = 'Zapisz preferencje',
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
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    setMaxPrice(initialValues.maxPrice ?? '')
    setCurrency(initialValues.currency)
    setSmokingAllowed(toBooleanPreferenceValue(initialValues.smokingAllowed))
    setPetsAllowed(toBooleanPreferenceValue(initialValues.petsAllowed))
    setPreferredDistricts(districtsToInputValue(initialValues.preferredDistricts))
    setErrors({})
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

  useEffect(() => {
    onChange?.(normalizedValues)
  }, [normalizedValues, onChange])

  function validateForm(values: TenantPreferences): FormErrors {
    const nextErrors: FormErrors = {}

    if (values.maxPrice !== null && (!Number.isFinite(values.maxPrice) || values.maxPrice < 0)) {
      nextErrors.maxPrice = 'Maksymalna cena musi być liczbą większą lub równą 0.'
    }

    return nextErrors
  }

  function handleSubmit(event: JSX.TargetedSubmitEvent<HTMLFormElement>) {
    event.preventDefault()

    const nextErrors = validateForm(normalizedValues)
    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    void onSubmit(normalizedValues)
  }

  function handleReset() {
    setMaxPrice('')
    setCurrency('PLN')
    setSmokingAllowed('null')
    setPetsAllowed('null')
    setPreferredDistricts('')
    setErrors({})
  }

  return (
    <form class="flex flex-col gap-6" onSubmit={handleSubmit}>
      <div class="rounded-box bg-base-200/40 p-4 text-sm text-base-content/80">
        Uzupełnij tylko te pola, które faktycznie mają wpływ na dopasowanie mieszkań. Puste pola będą traktowane jako
        brak preferencji.
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <NumberInput
          id="tenant-preferences-max-price"
          name="maxPrice"
          label="Maksymalny budżet miesięczny"
          value={maxPrice}
          min={0}
          step={50}
          placeholder="np. 1500"
          error={errors.maxPrice}
          disabled={isSubmitting}
          onInput={(event) => {
            const value = (event.currentTarget as HTMLInputElement).value
            setMaxPrice(value === '' ? '' : Number(value))
          }}
        />

        <SelectInput
          id="tenant-preferences-currency"
          name="currency"
          label="Waluta"
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
          label="Palenie"
          value={smokingAllowed}
          disabled={isSubmitting}
          onChange={(event) => {
            const target = event.currentTarget as HTMLSelectElement
            setSmokingAllowed(target.value as BooleanPreferenceValue)
          }}
          options={[
            { value: 'null', label: 'Bez preferencji' },
            { value: 'true', label: 'Dozwolone' },
            { value: 'false', label: 'Niedozwolone' },
          ]}
        />

        <SelectInput
          id="tenant-preferences-pets"
          name="petsAllowed"
          label="Zwierzęta"
          value={petsAllowed}
          disabled={isSubmitting}
          onChange={(event) => {
            const target = event.currentTarget as HTMLSelectElement
            setPetsAllowed(target.value as BooleanPreferenceValue)
          }}
          options={[
            { value: 'null', label: 'Bez preferencji' },
            { value: 'true', label: 'Dozwolone' },
            { value: 'false', label: 'Niedozwolone' },
          ]}
        />
      </div>

      <TextInput
        id="tenant-preferences-districts"
        name="preferredDistricts"
        label="Preferowane dzielnice"
        value={preferredDistricts}
        placeholder="np. Mokotów, Ochota, Wola"
        disabled={isSubmitting}
        onInput={(event) => setPreferredDistricts((event.currentTarget as HTMLInputElement).value)}
      />

      <div class="text-sm text-base-content/70">
        Wpisz dzielnice po przecinku. Duplikaty zostaną automatycznie usunięte przy zapisie.
      </div>

      {saveMessage ? <div class="alert alert-success text-sm">{saveMessage}</div> : null}

      <div class="flex flex-wrap justify-end gap-3">
        <AppButton type="button" variant="outline" disabled={isSubmitting} onClick={handleReset}>
          Wyczyść formularz
        </AppButton>

        <AppButton type="submit" loading={isSubmitting}>
          {submitLabel}
        </AppButton>
      </div>
    </form>
  )
}