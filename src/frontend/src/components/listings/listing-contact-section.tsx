import { TextInput } from '../ui/text-input'

type ListingContactSectionProps = {
  formData: {
    contact: string
    phone?: string
  }
  errors: Partial<Record<'contact' | 'phone', string>>
  onUpdate: <K extends keyof ListingContactSectionProps['formData']>(field: K, value: string) => void
}

export function ListingContactSection({ formData, errors, onUpdate }: ListingContactSectionProps) {
  return (
    <div class="space-y-6 card-body">
      <div>
        <h2 class="text-xl font-semibold">Dane kontaktowe</h2>
        <p class="text-sm text-base-content/65">Jak lokatorzy mogą się z Tobą skontaktować.</p>
      </div>

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

      <div class="alert alert-info text-sm">
        <svg class="h-5 w-5 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <span>Twoja poczta email z konta będzie automatycznie dodana jako dane kontaktowe.</span>
        </div>
      </div>
    </div>
  )
}
