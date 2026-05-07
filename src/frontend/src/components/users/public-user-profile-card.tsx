import type { User } from '../../types/user'

type PublicUserProfileCardProps = {
  user: User
}

function getFullName(user: User): string {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return fullName || 'FlatShare user'
}

function getInitials(user: User): string {
  const firstInitial = user.firstName.trim().charAt(0)
  const lastInitial = user.lastName.trim().charAt(0)
  const initials = `${firstInitial}${lastInitial}`.trim().toUpperCase()

  return initials || 'FS'
}

function getRoleLabel(role: string): string {
  switch (role.toUpperCase()) {
    case 'LANDLORD':
      return 'Landlord'
    case 'TENANT':
      return 'Tenant'
    case 'ADMIN':
      return 'Admin'
    default:
      return role
  }
}

function getRoleDescription(role: string): string {
  switch (role.toUpperCase()) {
    case 'LANDLORD':
      return 'This user can publish room listings and manage rental offers.'
    case 'TENANT':
      return 'This user can browse listings, set preferences and contact owners.'
    case 'ADMIN':
      return 'This user helps moderate the FlatShare platform.'
    default:
      return 'This user is part of the FlatShare community.'
  }
}

function getRoleBadgeClass(role: string): string {
  switch (role.toUpperCase()) {
    case 'LANDLORD':
      return 'badge-success badge-soft'
    case 'TENANT':
      return 'badge-info badge-soft'
    case 'ADMIN':
      return 'badge-warning badge-soft'
    default:
      return 'badge-neutral badge-soft'
  }
}

export function PublicUserProfileCard({ user }: PublicUserProfileCardProps) {
  const displayName = getFullName(user)
  const initials = getInitials(user)
  const email = user.email.trim()
  const roleLabel = getRoleLabel(user.role)
  const roleDescription = getRoleDescription(user.role)

  return (
    <article class="card overflow-hidden border border-base-300 bg-base-100 shadow-sm">
      <div class="card-body gap-6">
        <div class="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div class="flex items-center gap-4">
            <div class="avatar placeholder">
              <div class="w-20 rounded-full bg-primary text-primary-content">
                <span class="text-2xl font-semibold">{initials}</span>
              </div>
            </div>

            <div class="min-w-0">
              <h1 class="text-2xl font-bold leading-tight">{displayName}</h1>
              <div class="mt-2 flex flex-wrap items-center gap-2">
                <span class={`badge ${getRoleBadgeClass(user.role)}`}>{roleLabel}</span>
                <span class="text-sm text-base-content/60">FlatShare user profile</span>
              </div>
            </div>
          </div>

          {email ? (
            <a class="btn btn-primary btn-sm sm:btn-md" href={`mailto:${email}`}>
              Send email
            </a>
          ) : null}
        </div>

        <div class="rounded-box border border-base-300/70 bg-base-200/40 p-4">
          <p class="text-sm leading-relaxed text-base-content/75">{roleDescription}</p>
        </div>

        <div class="grid gap-3 sm:grid-cols-2">
          <div class="rounded-box border border-base-300/70 bg-base-100 px-4 py-3">
            <span class="block text-xs font-medium uppercase tracking-wide text-base-content/50">
              Name
            </span>
            <span class="mt-1 block text-sm font-semibold">{displayName}</span>
          </div>

          <div class="rounded-box border border-base-300/70 bg-base-100 px-4 py-3">
            <span class="block text-xs font-medium uppercase tracking-wide text-base-content/50">
              Role
            </span>
            <span class="mt-1 block text-sm font-semibold">{roleLabel}</span>
          </div>

          <div class="rounded-box border border-base-300/70 bg-base-100 px-4 py-3 sm:col-span-2">
            <span class="block text-xs font-medium uppercase tracking-wide text-base-content/50">
              Contact email
            </span>

            {email ? (
              <a
                class="mt-1 inline-block text-sm font-semibold text-primary hover:underline"
                href={`mailto:${email}`}
              >
                {email}
              </a>
            ) : (
              <span class="mt-1 block text-sm text-base-content/60">Email is not available.</span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}