import { apiRequest } from './api-client'
import type { ViolationReportTargetType } from '../types/violation-report'

export const adminReportStatuses = [
  'Open',
  'UnderReview',
  'ActionTaken',
  'ClosedNoAction',
] as const

export type AdminReportStatus = (typeof adminReportStatuses)[number]

export type AdminViolationReport = {
  id: string
  targetType: ViolationReportTargetType
  targetId: string
  reporterId: string
  reporterEmail: string
  reason: string
  details: string | null
  status: AdminReportStatus
  createdAt: string
  handledByEmail: string | null
  handledAt: string | null
}

export type AdminReportsQuery = {
  page?: number
  size?: number
  status?: AdminReportStatus
}

type AdminViolationReportDto = {
  id?: string
  Id?: string
  targetType?: string | number | null
  TargetType?: string | number | null
  targetId?: string
  TargetId?: string
  reporterId?: string
  ReporterId?: string
  reporterEmail?: string
  ReporterEmail?: string
  reason?: string
  Reason?: string
  details?: string | null
  Details?: string | null
  status?: string | number | null
  Status?: string | number | null
  createdAt?: string
  CreatedAt?: string
  handledByEmail?: string | null
  HandledByEmail?: string | null
  handledAt?: string | null
  HandledAt?: string | null
}

const adminReportStatusCodeByValue: Record<AdminReportStatus, number> = {
  Open: 0,
  UnderReview: 1,
  ActionTaken: 2,
  ClosedNoAction: 3,
}

const adminReportStatusByCode: Record<number, AdminReportStatus> = {
  0: 'Open',
  1: 'UnderReview',
  2: 'ActionTaken',
  3: 'ClosedNoAction',
}

function getAuthHeaders(token: string, type = 'Bearer'): Record<string, string> {
  return {
    Authorization: `${type} ${token}`,
  }
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') {
    return value
  }

  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

function toNullableString(value: unknown): string | null {
  const stringValue = toStringValue(value).trim()
  return stringValue.length > 0 ? stringValue : null
}

function normalizeAdminReportStatus(value: string | number | null | undefined): AdminReportStatus {
  if (typeof value === 'number') {
    return adminReportStatusByCode[value] ?? 'Open'
  }

  if (typeof value !== 'string') {
    return 'Open'
  }

  const normalized = value.trim().replace(/[\s_-]/g, '').toLowerCase()

  switch (normalized) {
    case 'underreview':
      return 'UnderReview'

    case 'actiontaken':
      return 'ActionTaken'

    case 'closednoaction':
      return 'ClosedNoAction'

    case 'open':
    default:
      return 'Open'
  }
}

function normalizeTargetType(value: string | number | null | undefined): ViolationReportTargetType {
  if (typeof value === 'number') {
    return value === 1 ? 'USER' : 'LISTING'
  }

  if (typeof value !== 'string') {
    return 'LISTING'
  }

  const normalized = value.trim().toUpperCase()

  return normalized === 'USER' ? 'USER' : 'LISTING'
}

function buildReportsQueryString(query?: AdminReportsQuery): string {
  const searchParams = new URLSearchParams()

  searchParams.set('Page', String(query?.page ?? 0))
  searchParams.set('Size', String(query?.size ?? 50))

  if (query?.status) {
    searchParams.set('Status', String(adminReportStatusCodeByValue[query.status]))
  }

  const queryString = searchParams.toString()

  return queryString ? `?${queryString}` : ''
}

function mapReportDtoToReport(item: AdminViolationReportDto): AdminViolationReport {
  return {
    id: toStringValue(item.id ?? item.Id),
    targetType: normalizeTargetType(item.targetType ?? item.TargetType),
    targetId: toStringValue(item.targetId ?? item.TargetId),
    reporterId: toStringValue(item.reporterId ?? item.ReporterId),
    reporterEmail: toStringValue(item.reporterEmail ?? item.ReporterEmail),
    reason: toStringValue(item.reason ?? item.Reason),
    details: toNullableString(item.details ?? item.Details),
    status: normalizeAdminReportStatus(item.status ?? item.Status),
    createdAt: toStringValue(item.createdAt ?? item.CreatedAt),
    handledByEmail: toNullableString(item.handledByEmail ?? item.HandledByEmail),
    handledAt: toNullableString(item.handledAt ?? item.HandledAt),
  }
}

export async function getAdminReports(
  token: string,
  query?: AdminReportsQuery,
  type = 'Bearer',
): Promise<AdminViolationReport[]> {
  const items = await apiRequest<AdminViolationReportDto[]>(
    `/admin/reports${buildReportsQueryString(query)}`,
    {
      method: 'GET',
      headers: getAuthHeaders(token, type),
    },
  )

  return items.map(mapReportDtoToReport)
}

export async function updateAdminReportStatus(
  reportId: string,
  status: AdminReportStatus,
  token: string,
  type = 'Bearer',
): Promise<void> {
  await apiRequest<void>(`/admin/reports/${reportId}/status`, {
    method: 'PATCH',
    body: adminReportStatusCodeByValue[status],
    headers: getAuthHeaders(token, type),
  })
}

export async function banAdminUser(
  userId: string,
  reason: string,
  token: string,
  type = 'Bearer',
): Promise<void> {
  await apiRequest<void>(`/admin/users/${userId}/ban`, {
    method: 'POST',
    body: {
      reason: reason.trim(),
    },
    headers: getAuthHeaders(token, type),
  })
}