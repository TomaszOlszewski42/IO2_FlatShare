export type ListingLocation = {
  city: string
  district?: string
  street?: string
  buildingNumber?: string
  postalCode?: string
}

export type MockListing = {
  listingId: string
  title: string
  description: string
  status: 'DRAFT' | 'UNDER_REVIEW' | 'ACTIVE' | 'HIDDEN' | 'ARCHIVED'
  price: number
  currency: string
  area: number
  rooms: number
  bathrooms: number
  availableFrom: string
  location: ListingLocation
  contact: string
  phone?: string
  allowPets: boolean
  allowSmoking: boolean
  furnished: boolean
}

export const mockListings: MockListing[] = [
  {
    listingId: 'listing-001',
    title: 'Pokój 1-osobowy blisko Politechniki',
    description: 'Jasny pokój w mieszkaniu po remoncie, z biurkiem, szafą i szybkim internetem.',
    status: 'ACTIVE',
    price: 1850,
    currency: 'PLN',
    area: 14,
    rooms: 1,
    bathrooms: 1,
    availableFrom: '2026-05-01',
    location: {
      city: 'Warszawa',
      district: 'Mokotów',
      street: 'Puławska',
      buildingNumber: '120',
      postalCode: '02-789',
    },
    contact: 'Jan Kowalski',
    phone: '+48 600 700 800',
    allowPets: true,
    allowSmoking: false,
    furnished: true,
  },
  {
    listingId: 'listing-002',
    title: 'Słoneczny pokój z balkonem',
    description: 'Pokój z dostępem do balkonu i wspólnej kuchni, w spokojnej okolicy.',
    status: 'UNDER_REVIEW',
    price: 2100,
    currency: 'PLN',
    area: 17.5,
    rooms: 1,
    bathrooms: 1,
    availableFrom: '2026-06-01',
    location: {
      city: 'Kraków',
      district: 'Podgórze',
      street: 'Kalwaryjska',
      buildingNumber: '54A',
      postalCode: '30-504',
    },
    contact: 'Anna Nowak',
    phone: '+48 601 200 300',
    allowPets: false,
    allowSmoking: false,
    furnished: false,
  },
  {
    listingId: 'listing-003',
    title: 'Duży pokój w mieszkaniu 3-pokojowym',
    description: 'Duży pokój w mieszkaniu z trzema pokojami i oddzielną łazienką.',
    status: 'HIDDEN',
    price: 1650,
    currency: 'PLN',
    area: 15,
    rooms: 3,
    bathrooms: 1,
    availableFrom: '2026-04-20',
    location: {
      city: 'Wrocław',
      district: 'Krzyki',
      street: 'Powstańców Śląskich',
      buildingNumber: '42',
      postalCode: '53-334',
    },
    contact: 'Piotr Zielinski',
    phone: '+48 602 300 400',
    allowPets: true,
    allowSmoking: false,
    furnished: true,
  },
  {
    listingId: 'listing-004',
    title: 'Pokój premium w centrum',
    description: 'Premium pokój w centrum z szybkim dojazdem i pełnym umeblowaniem.',
    status: 'ARCHIVED',
    price: 2500,
    currency: 'PLN',
    area: 19,
    rooms: 2,
    bathrooms: 1,
    availableFrom: '2026-01-01',
    location: {
      city: 'Gdańsk',
      district: 'Śródmieście',
      street: 'Dluga',
      buildingNumber: '11',
      postalCode: '80-831',
    },
    contact: 'Marta Wiśniewska',
    phone: '+48 603 400 500',
    allowPets: false,
    allowSmoking: false,
    furnished: true,
  },
]

export const mockListingById = Object.fromEntries(
  mockListings.map((listing) => [listing.listingId, listing]),
) as Record<string, MockListing>