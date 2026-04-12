type LocationInput = {
  city: string
  district?: string
  street?: string
  buildingNumber?: string
  postalCode?: string
}

export function formatLocation({ city, district, street, buildingNumber, postalCode }: LocationInput): string {
  const streetLine = [street, buildingNumber].filter(Boolean).join(' ')
  const leftPart = [city, district].filter(Boolean).join(', ')
  const fullLine = [leftPart, streetLine, postalCode].filter(Boolean).join(', ')

  return fullLine || '-'
}
