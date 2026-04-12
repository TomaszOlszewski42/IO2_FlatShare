type LocationInput = {
  city: string
  district?: string | null
  street?: string | null
  aptNumber?: string | null
  buildingNumber?: string | null
  postalCode?: string | null
}

export function formatLocation({ city, district, street, aptNumber, buildingNumber, postalCode }: LocationInput): string {
  const number = aptNumber ?? buildingNumber
  const streetLine = [street, number].filter(Boolean).join(' ')
  const leftPart = [city, district].filter(Boolean).join(', ')
  const fullLine = [leftPart, streetLine, postalCode].filter(Boolean).join(', ')

  return fullLine || '-'
}
