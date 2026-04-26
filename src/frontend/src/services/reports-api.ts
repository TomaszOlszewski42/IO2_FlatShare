import { apiRequest } from './api-client'
import { readAuthSession } from './auth-session'
import type {
  CreateViolationReportPayload,
  CreateViolationReportResponse,
} from '../types/violation-report'

function getAuthHeaders(token?: string, type = 'Bearer'): Record<string, string> {
  if (token) {
    return {
      Authorization: `${type} ${token}`,
    }
  }

  const session = readAuthSession()

  if (!session) {
    throw new Error('Brak aktywnej sesji użytkownika.')
  }

  return {
    Authorization: `${session.type} ${session.token}`,
  }
}

function normalizeViolationReportPayload(
  payload: CreateViolationReportPayload,
): CreateViolationReportPayload {
  return {
    type: payload.type,
    targetId: payload.targetId,
    reason: payload.reason.trim(),
    details: payload.details?.trim() ?? '',
  }
}

export async function createViolationReport(
  payload: CreateViolationReportPayload,
  token?: string,
  type = 'Bearer',
): Promise<CreateViolationReportResponse | null> {
  return apiRequest<CreateViolationReportResponse | null>('/reports', {
    method: 'POST',
    body: normalizeViolationReportPayload(payload),
    headers: getAuthHeaders(token, type),
  })
}