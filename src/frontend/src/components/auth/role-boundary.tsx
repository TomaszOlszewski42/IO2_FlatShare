import type { ComponentChildren } from 'preact'
import { useAuth } from '../../hooks/use-auth'
import { UserRole } from '../../types/user'

type RoleBoundaryProps = {
  children: ComponentChildren
  requiredRole?: UserRole | UserRole[]
  fallback?: ComponentChildren
}

export function RoleBoundary({ children, requiredRole, fallback = null }: RoleBoundaryProps) {
  const { hasRole } = useAuth()

  if (!requiredRole) {
    return <>{children}</>
  }

  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
  const isAuthorized = roles.some((role) => hasRole(role))

  if (!isAuthorized) {
    return <>{fallback}</>
  }

  return <>{children}</>
}
