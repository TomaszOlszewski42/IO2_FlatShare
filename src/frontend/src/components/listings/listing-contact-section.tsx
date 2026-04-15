import { InfoAlert } from '../common/info-alert'
import { TextInput } from '../ui/text-input'
import { ListingFormSection } from './listing-form-section'

type ListingContactSectionProps = {
  formData: {
    contact: string
    phone?: string
  }
  errors: Partial<Record<'contact' | 'phone', string>>
  onUpdate: <K extends keyof ListingContactSectionProps['formData']>(
    field: K,
    value: string
  ) => void
}

export function ListingContactSection({
  formData,
  errors,
  onUpdate,
}: ListingContactSectionProps) {
  return (
    <ListingFormSection
      title="Dane kontaktowe"
      description="Jak lokatorzy mogą się z Tobą skontaktować."
    >
      <TextInput
        id="contact"
        name="contact"
        label="Nazwa/Imię i nazwisko"
        placeholder="np. Jan Kowalski"
        required
        value={formData.contact}
        error={errors.contact}
        onInput={(e) => {
          const target = e.currentTarget as HTMLInputElement
          onUpdate('contact', target.value)
        }}
      />

      <TextInput
        id="phone"
        name="phone"
        label="Numer telefonu (opcjonalnie)"
        type="text"
        placeholder="np. +48 123 456 789"
        value={formData.phone || ''}
        error={errors.phone}
        onInput={(e) => {
          const target = e.currentTarget as HTMLInputElement
          onUpdate('phone', target.value)
        }}
      />

      <InfoAlert>
        <span>Twoja poczta email z konta będzie automatycznie dodana jako dane kontaktowe.</span>
      </InfoAlert>
    </ListingFormSection>
  )
}