import { apiRequest } from './api-client'

export type PasswordResetRequestPayload = {
  email: string
}

export type PasswordResetConfirmPayload = {
  resetToken: string
  newPassword: string
}

export type PasswordResetRequestResponse = {
  message: string
}

export type PasswordResetConfirmResponse = {
  message: string
}

export async function requestPasswordReset(
  payload: PasswordResetRequestPayload,
): Promise<PasswordResetRequestResponse> {
  return apiRequest<PasswordResetRequestResponse>('/auth/password-reset/request', {
    method: 'POST',
    body: payload,
  })
}

export async function confirmPasswordReset(
  payload: PasswordResetConfirmPayload,
): Promise<PasswordResetConfirmResponse> {
  return apiRequest<PasswordResetConfirmResponse>('/auth/password-reset/confirm', {
    method: 'POST',
    body: payload,
  })
}