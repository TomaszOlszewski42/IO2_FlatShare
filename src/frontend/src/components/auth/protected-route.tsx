import { useEffect } from 'preact/hooks'
import { route, type RoutableProps } from 'preact-router'
import { useAuth } from '../../hooks/use-auth'
import { UserRole } from '../../types/user'
import type { ComponentChildren } from 'preact'

type ProtectedRouteProps = RoutableProps & {
  component: (props: any) => ComponentChildren
  requiredRole?: UserRole
}

export function ProtectedRoute({ component: Component, requiredRole, ...props }: ProtectedRouteProps) {
  const { isAuthenticated, hasRole } = useAuth()

  useEffect(() => {
    // If we're not authenticated, go to login
    if (!isAuthenticated) {
      route(`/login?returnTo=${encodeURIComponent(props.path || '/')}`, true)
      return
    }

    // If a specific role is required and we don't have it
    if (requiredRole && !hasRole(requiredRole)) {
      route('/', true)
    }
  }, [isAuthenticated, requiredRole, hasRole, props.path])

  if (!isAuthenticated || (requiredRole && !hasRole(requiredRole))) {
    return null
  }

  return <Component {...props} />
}
