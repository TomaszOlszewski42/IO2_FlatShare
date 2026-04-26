export const violationReportTargetTypes = ['LISTING', 'USER'] as const

export type ViolationReportTargetType = (typeof violationReportTargetTypes)[number]

export const violationReportReasons = [
  'Podejrzenie oszustwa',
  'Niezgodne lub wprowadzające w błąd treści',
  'Dane wrażliwe lub prywatne w opisie',
  'Nieodpowiednie zdjęcia',
  'Spam',
  'Inny powód',
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