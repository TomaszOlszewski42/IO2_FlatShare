import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import { ListingCreateForm } from '../../components/listings/listing-create-form'

export function ListingCreatePage(_: RoutableProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(formData: any) {
    setIsSubmitting(true)
    try {
      // TODO: Call API to create listing
      console.log('Creating listing:', formData)
      // Temporary: redirect to listings page on success
      route('/listings')
    } catch (error) {
      console.error('Failed to create listing:', error)
      setIsSubmitting(false)
    }
  }

  return (
    <div class="flex w-full flex-1 flex-col py-6">
      <div class="container mx-auto max-w-3xl px-4">
        <div class="mb-6">
          <h1 class="mb-2 text-3xl font-bold">Tworzenie ogłoszenia</h1>
          <p class="text-base-content/70">Podziel się szczegółami swojego mieszkania z potencjalnymi lokatorami.</p>
        </div>

        <ListingCreateForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </div>
    </div>
  )
}
