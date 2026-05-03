export const violationReportTargetTypes = ['LISTING', 'USER'] as const

export type ViolationReportTargetType = (typeof violationReportTargetTypes)[number]

export const violationReportReasons = [
  'Suspected fraud',
  'Incompatible or misleading content',
  'Sensitive or private data in description',
  'Inappropriate photos',
  'Spam',
  'Other reason',
] as const

export type ViolationReportReason = (typeof violationReportReasons)[number]

export type CreateViolationReportPayload = {
  type: ViolationReportTargetType
  targetId: string
  reason: string
  details?: string | null
}

export type CreateViolationReportResponse = {
  id?: string
  reportId?: string
  status?: string
  createdAt?: string
}