export const UserRole = {
  Tenant: 'TENANT',
  Landlord: 'LANDLORD',
  Admin: 'ADMIN',
} as const

export type UserRole = (typeof UserRole)[keyof typeof UserRole]

export type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  role: UserRole
}