import { apiRequest } from './api-client'
import { readAuthSession } from './auth-session'
import type {
  CreateViolationReportPayload,
  CreateViolationReportResponse,
  ViolationReportTargetType,
} from '../types/violation-report'

type BackendViolationReportTargetType = 0 | 1

type CreateViolationReportBackendPayload = {
  type: BackendViolationReportTargetType
  targetId: string
  reason: string
  details: string
}

const targetTypeCodeByValue: Record<ViolationReportTargetType, BackendViolationReportTargetType> = {
  LISTING: 0,
  USER: 1,
}

function getAuthHeaders(token?: string, type = 'Bearer'): Record<string, string> {
  if (token) {
    return {
      Authorization: `${type} ${token}`,
    }
  }

  const session = readAuthSession()

  if (!session) {
    throw new Error('No active user session.')
  }

  return {
    Authorization: `${session.type} ${session.token}`,
  }
}

function normalizeViolationReportPayload(
  payload: CreateViolationReportPayload,
): CreateViolationReportBackendPayload {
  return {
    type: targetTypeCodeByValue[payload.type],
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