import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { EmptyStateContent } from '../../components/common/empty-state-content'
import { ListingDetailsHeader } from '../../components/listings/listing-details-header'
import { ListingDetailsSkeleton } from '../../components/listings/listing-details-skeleton'
import { ListingFeatureBadges } from '../../components/listings/listing-feature-badges'
import { ListingGallery } from '../../components/listings/listing-gallery'
import { ListingLocationSection } from '../../components/listings/listing-location-section'
import { ListingMetaRow } from '../../components/listings/listing-meta-row'
import { ListingOpinionsSection } from '../../components/listings/listing-opinions-section'
import { ListingParametersSection } from '../../components/listings/listing-parameters-section'
import { ListingSection } from '../../components/listings/listing-section'
import { ListingTenantContactPanel } from '../../components/listings/listing-tenant-contact-panel'
import { ListingUserAttributesSection } from '../../components/listings/listing-user-attributes-section'
import { ReportViolationDialog } from '../../components/reports/report-violation-dialog'
import { AppButton } from '../../components/ui/app-button'
import { useAuth } from '../../hooks/use-auth'
import { readAuthSession } from '../../services/auth-session'
import { useErrorHandler } from '../../services/error-handler-context'
import { getListingById, getListingPhotoIds } from '../../services/listings-api'
import { createViolationReport } from '../../services/reports-api'
import type { Listing } from '../../types/listing'
import type { CreateViolationReportPayload } from '../../types/violation-report'
import { formatArea } from '../../utils/format-area'
import { formatDate } from '../../utils/format-date'
import { formatPrice } from '../../utils/format-price'
import { formatStatusLabel } from '../../utils/format-status-label'

type ListingDetailsRouteProps = RoutableProps & {
  listingId?: string
}

export function ListingDetailsPage({ listingId }: ListingDetailsRouteProps) {
  const { showToast } = useErrorHandler()
  const { isLandlord, isTenant } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [listing, setListing] = useState<Listing | null>(null)
  const [photoIds, setPhotoIds] = useState<string[]>([])
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  useEffect(() => {
    if (!listingId) {
      setIsLoading(false)
      setListing(null)
      setPhotoIds([])
      return
    }

    const session = readAuthSession()

    if (!session) {
      route('/login')
      return
    }

    let isMounted = true

    setIsLoading(true)

    void Promise.all([
      getListingById(listingId, session.token, session.type),
      getListingPhotoIds(listingId, session.token, session.type),
    ])
      .then(([item, photos]) => {
        if (isMounted) {
          setListing(item)
          setPhotoIds(photos)
        }
      })
      .catch(() => {
        if (isMounted) {
          setListing(null)
          setPhotoIds([])
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [listingId])

  async function handleCreateViolationReport(payload: CreateViolationReportPayload) {
    const session = readAuthSession()

    if (!session) {
      route('/login')
      throw new Error('To report a violation, please log in again.')
    }

    await createViolationReport(payload, session.token, session.type)

    showToast('The report has been sent to moderation.', 'success')
  }

  if (isLoading) {
    return <ListingDetailsSkeleton />
  }

  if (!listing) {
    return (
      <section class="flex h-full w-full flex-col items-center justify-center py-12">
        <EmptyStateContent
          icon="🔍"
          titleAs="h1"
          title="Listing not found"
          description="We are sorry, but the listing you are looking for does not exist or has been removed."
        >
          <AppButton onClick={() => route('/listings')}>Back to listings</AppButton>
        </EmptyStateContent>
      </section>
    )
  }

  const parameterRows = [
    { label: 'Price', value: `${formatPrice(listing.price)} / month`, icon: listing.currency },
    { label: 'Area', value: listing.area ? formatArea(listing.area) : '-', icon: 'm2' },
    { label: 'Available from', value: listing.availableFrom ? formatDate(listing.availableFrom) : '-' },
  ]

  if (isLandlord) {
    parameterRows.push({
      label: 'Publication status',
      value: listing.status ? formatStatusLabel(listing.status) : '-',
    })
  }

  const featureRows = [
    { label: 'Furnished', value: Boolean(listing.furnished) },
    { label: 'Pets in the apartment', value: Boolean(listing.allowPets) },
    { label: 'Smoking in the apartment', value: Boolean(listing.allowSmoking) },
  ]

  return (
    <section class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
      <ListingDetailsHeader
        title={listing.title}
        onBack={() => route('/listings')}
        onEdit={() => route(`/listings/${listing.id}/edit`)}
        onArchive={() => {
          // Placeholder for API action.
        }}
        onReportViolation={() => setIsReportDialogOpen(true)}
      />

      <ReportViolationDialog
        isOpen={isReportDialogOpen}
        targetId={listing.id}
        targetType="LISTING"
        targetLabel={listing.title}
        onClose={() => setIsReportDialogOpen(false)}
        onSubmit={handleCreateViolationReport}
      />

      <div class="grid gap-4 lg:grid-cols-2">
        <ListingParametersSection rows={parameterRows} />

        <ListingSection title="Attributes">
          <ListingFeatureBadges features={featureRows} />
        </ListingSection>
      </div>

      {listing.unavailability && listing.unavailability.length > 0 && (
        <ListingSection title="Unavailability Calendar">
          <div class="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {listing.unavailability.map((u, i) => (
              <div key={i} class="rounded-lg border border-base-300 p-4 shadow-sm bg-base-100">
                <div class="flex flex-col gap-1">
                  <span class="text-sm font-semibold text-primary">
                    {formatDate(u.since)} - {formatDate(u.until)}
                  </span>
                  {u.message ? (
                    <span class="text-sm text-base-content/80">{u.message}</span>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </ListingSection>
      )}

      <ListingGallery listingId={listing.id} photoIds={photoIds} title={listing.title} />

      {isTenant ? <ListingTenantContactPanel listing={listing} /> : null}

      <ListingUserAttributesSection attributes={listing.attributes} />

      <ListingLocationSection location={listing.location} />

      <ListingSection title="Description">
        <p class="text-sm leading-relaxed text-base-content/80">{listing.description}</p>

        {isLandlord ? (
          <div class="mt-3 grid gap-2 md:grid-cols-2">
            <ListingMetaRow label="Contact" value={listing.contact || listing.ownerContact || '-'} />
            <ListingMetaRow label="Phone" value={listing.phone || listing.contactPhone || '-'} />
            <ListingMetaRow label="Status" value={listing.status ? formatStatusLabel(listing.status) : '-'} />
          </div>
        ) : null}
      </ListingSection>

      <ListingOpinionsSection listingId={listing.id} />
    </section>
  )
}