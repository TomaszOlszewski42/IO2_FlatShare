import type { RoutableProps } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { EmptyStateContent } from '../../components/common/empty-state-content'
import { InfoAlert } from '../../components/common/info-alert'
import { AppButton } from '../../components/ui/app-button'
import { useAuth } from '../../hooks/use-auth'
import {
  adminReportStatuses,
  getAdminReports,
  updateAdminReportStatus,
  type AdminReportStatus,
  type AdminViolationReport,
} from '../../services/admin-api'

type ReportStatusFilter = AdminReportStatus | 'ALL'

const statusLabels: Record<AdminReportStatus, string> = {
  Open: 'Open',
  UnderReview: 'Under review',
  ActionTaken: 'Action taken',
  ClosedNoAction: 'Closed without action',
}

const statusBadgeClasses: Record<AdminReportStatus, string> = {
  Open: 'badge-warning',
  UnderReview: 'badge-info',
  ActionTaken: 'badge-success',
  ClosedNoAction: 'badge-neutral',
}

function formatDateTime(value: string): string {
  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function getReadableAdminError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return 'Failed to load moderation reports.'
}

function getReadableActionError(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return 'Action could not be completed.'
}

function getTargetTypeLabel(report: AdminViolationReport): string {
  return report.targetType === 'USER' ? 'Reported user' : 'Reported listing'
}

function AdminReportStatusBadge({ status }: { status: AdminReportStatus }) {
  return (
    <span class={`badge ${statusBadgeClasses[status]}`}>
      {statusLabels[status]}
    </span>
  )
}

type AdminReportTargetBoxProps = {
  report: AdminViolationReport
}

function AdminReportTargetBox({ report }: AdminReportTargetBoxProps) {
  const isListingReport = report.targetType === 'LISTING'

  return (
    <div class="rounded-box bg-base-200 px-3 py-2 text-xs text-base-content/70">
      <div class="font-semibold text-base-content">
        {isListingReport ? 'Listing ID' : 'User ID'}
      </div>

      <div class="break-all font-mono">{report.targetId}</div>

      {isListingReport ? (
        <a
          class="btn btn-outline btn-xs mt-3 w-full"
          href={`/listings/${encodeURIComponent(report.targetId)}`}
        >
          Open listing
        </a>
      ) : null}
    </div>
  )
}

type AdminReportCardProps = {
  report: AdminViolationReport
  token: string
  tokenType: string
  onStatusUpdated: () => void
}

function AdminReportCard({
  report,
  token,
  tokenType,
  onStatusUpdated,
}: AdminReportCardProps) {
  const [selectedStatus, setSelectedStatus] = useState<AdminReportStatus>(report.status)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [statusUpdateError, setStatusUpdateError] = useState<string | null>(null)

  const hasStatusChanged = selectedStatus !== report.status

  async function handleStatusUpdate() {
    if (!hasStatusChanged || isUpdatingStatus) {
      return
    }

    setIsUpdatingStatus(true)
    setStatusUpdateError(null)

    try {
      await updateAdminReportStatus(report.id, selectedStatus, token, tokenType)
      onStatusUpdated()
    } catch (error) {
      console.error('Failed to update report status:', error)
      setStatusUpdateError(getReadableActionError(error))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  return (
    <article class="card border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body gap-4">
        <div class="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <span class="badge badge-outline">{getTargetTypeLabel(report)}</span>
              <AdminReportStatusBadge status={report.status} />
            </div>

            <h2 class="card-title text-lg">{report.reason}</h2>

            <p class="text-sm text-base-content/65">
              Created: {formatDateTime(report.createdAt)}
            </p>
          </div>

          <AdminReportTargetBox report={report} />
        </div>

        {report.details ? (
          <p class="rounded-box bg-base-200/70 p-3 text-sm leading-relaxed text-base-content/80">
            {report.details}
          </p>
        ) : (
          <p class="text-sm italic text-base-content/55">
            No additional details were provided.
          </p>
        )}

        <div class="grid gap-3 text-sm md:grid-cols-2">
          <div>
            <div class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Reporter
            </div>
            <div class="break-all">{report.reporterEmail || report.reporterId}</div>
          </div>

          <div>
            <div class="text-xs font-semibold uppercase tracking-wide text-base-content/50">
              Handled by
            </div>
            <div>
              {report.handledByEmail
                ? `${report.handledByEmail}${report.handledAt ? ` · ${formatDateTime(report.handledAt)}` : ''}`
                : 'Not handled yet'}
            </div>
          </div>
        </div>

        <div class="divider my-0" />

        <div class="rounded-box border border-base-300 bg-base-200/40 p-4">
          <div class="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div class="space-y-1">
              <h3 class="font-semibold">Moderation action</h3>
              <p class="text-sm text-base-content/65">
                Change the report status after reviewing the case.
              </p>
            </div>

            <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
              <label class="form-control w-full min-w-56">
                <span class="label py-1">
                  <span class="label-text">New status</span>
                </span>

                <select
                  class="select select-bordered select-sm w-full bg-base-100"
                  value={selectedStatus}
                  disabled={isUpdatingStatus}
                  onChange={(event) => {
                    setSelectedStatus(
                      (event.currentTarget as HTMLSelectElement).value as AdminReportStatus,
                    )
                    setStatusUpdateError(null)
                  }}
                >
                  {adminReportStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </select>
              </label>

              <AppButton
                variant="primary"
                className="btn-sm"
                loading={isUpdatingStatus}
                disabled={!hasStatusChanged || isUpdatingStatus}
                onClick={handleStatusUpdate}
              >
                Update status
              </AppButton>
            </div>
          </div>

          {statusUpdateError ? (
            <div class="mt-3">
              <InfoAlert
                title="Status could not be updated"
                message={statusUpdateError}
                variant="error"
              />
            </div>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export function AdminReportsPage(_: RoutableProps) {
  const { session } = useAuth()

  const [reports, setReports] = useState<AdminViolationReport[]>([])
  const [statusFilter, setStatusFilter] = useState<ReportStatusFilter>('ALL')
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    if (!session) {
      return
    }

    let isMounted = true

    setIsLoading(true)
    setLoadError(null)

    void getAdminReports(
      session.token,
      {
        page: 0,
        size: 50,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      },
      session.type,
    )
      .then((items) => {
        if (isMounted) {
          setReports(items)
        }
      })
      .catch((error) => {
        console.error('Failed to load admin reports:', error)

        if (isMounted) {
          setReports([])
          setLoadError(getReadableAdminError(error))
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
  }, [session, statusFilter, reloadKey])

  const refreshReports = () => {
    setReloadKey((currentValue) => currentValue + 1)
  }

  return (
    <section class="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div class="space-y-2">
          <p class="text-sm font-semibold uppercase tracking-wide text-primary">
            Admin panel
          </p>

          <div class="space-y-1">
            <h1 class="text-3xl font-bold tracking-tight">Reports dashboard</h1>
            <p class="max-w-2xl text-sm text-base-content/65">
              Review user and listing violation reports submitted by FlatShare users.
            </p>
          </div>
        </div>

        <div class="flex flex-col gap-2 sm:flex-row sm:items-end">
          <label class="form-control w-full min-w-56">
            <span class="label">
              <span class="label-text">Status</span>
            </span>

            <select
              class="select select-bordered w-full"
              value={statusFilter}
              disabled={isLoading}
              onChange={(event) => {
                setStatusFilter((event.currentTarget as HTMLSelectElement).value as ReportStatusFilter)
              }}
            >
              <option value="ALL">All statuses</option>

              {adminReportStatuses.map((status) => (
                <option key={status} value={status}>
                  {statusLabels[status]}
                </option>
              ))}
            </select>
          </label>

          <AppButton
            variant="outline"
            className="btn-sm sm:mb-0"
            loading={isLoading}
            onClick={refreshReports}
          >
            Refresh
          </AppButton>
        </div>
      </div>

      <div class="stats border border-base-300 bg-base-100 shadow-sm">
        <div class="stat">
          <div class="stat-title">Loaded reports</div>
          <div class="stat-value text-2xl">{reports.length}</div>
          <div class="stat-desc">Showing up to 50 newest reports</div>
        </div>
      </div>

      {loadError ? (
        <InfoAlert
          title="Reports could not be loaded"
          message={loadError}
          variant="error"
        />
      ) : null}

      {isLoading ? (
        <div class="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} class="card border border-base-300 bg-base-100 shadow-sm">
              <div class="card-body gap-4">
                <div class="skeleton h-5 w-48" />
                <div class="skeleton h-8 w-2/3" />
                <div class="skeleton h-20 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {!isLoading && reports.length > 0 && session ? (
        <div class="grid gap-4">
          {reports.map((report) => (
            <AdminReportCard
              key={report.id}
              report={report}
              token={session.token}
              tokenType={session.type}
              onStatusUpdated={refreshReports}
            />
          ))}
        </div>
      ) : null}

      {!isLoading && reports.length === 0 && !loadError ? (
        <div class="rounded-box border border-dashed border-base-300 bg-base-100 px-4 py-12">
          <EmptyStateContent
            icon="🛡️"
            title="No reports found"
            description="There are no moderation reports matching the selected status."
          >
            {statusFilter !== 'ALL' ? (
              <AppButton variant="outline" onClick={() => setStatusFilter('ALL')}>
                Show all reports
              </AppButton>
            ) : null}
          </EmptyStateContent>
        </div>
      ) : null}
    </section>
  )
}