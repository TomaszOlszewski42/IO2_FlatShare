import { apiRequest } from './api-client'
import type { User } from '../types/user'

export async function getUserById(userId: string, token?: string, type = 'Bearer'): Promise<User> {
  return apiRequest<User>(`/users/${userId}`, {
    method: 'GET',
    headers: token
      ? {
          Authorization: `${type} ${token}`,
        }
      : undefined,
  })
}