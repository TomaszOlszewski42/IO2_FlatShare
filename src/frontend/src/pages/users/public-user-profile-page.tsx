import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { EmptyStateContent } from '../../components/common/empty-state-content'
import { ReportViolationDialog } from '../../components/reports/report-violation-dialog'
import { AppButton } from '../../components/ui/app-button'
import { PublicUserProfileCard } from '../../components/users/public-user-profile-card'
import { useAuth } from '../../hooks/use-auth'
import { ApiHttpError } from '../../services/api-client'
import { readAuthSession } from '../../services/auth-session'
import { useErrorHandler } from '../../services/error-handler-context'
import { createViolationReport } from '../../services/reports-api'
import { getUserById } from '../../services/user-api'
import type { User } from '../../types/user'
import type { CreateViolationReportPayload } from '../../types/violation-report'

type PublicUserProfilePageProps = RoutableProps & {
  userId?: string
}

function getReadableProfileError(error: unknown): string {
  if (error instanceof ApiHttpError) {
    if (error.status === 404) {
      return 'This user profile does not exist or is no longer available.'
    }

    if (error.status === 403) {
      return 'You do not have access to this user profile.'
    }
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim()
  }

  return 'Failed to load user profile.'
}

function getCurrentPath(): string {
  return `${window.location.pathname}${window.location.search}${window.location.hash}`
}

function getProfileDisplayName(user: User): string {
  const fullName = `${user.firstName} ${user.lastName}`.trim()

  return fullName || 'FlatShare user'
}

export function PublicUserProfilePage({ userId }: PublicUserProfilePageProps) {
  const { showToast } = useErrorHandler()
  const { session } = useAuth()

  const [isLoading, setIsLoading] = useState(true)
  const [user, setUser] = useState<User | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false)

  useEffect(() => {
    if (!userId) {
      setUser(null)
      setLoadError('Missing user profile id.')
      setIsLoading(false)
      return
    }

    let isMounted = true

    setIsLoading(true)
    setLoadError(null)

    void getUserById(userId)
      .then((profile) => {
        if (isMounted) {
          setUser(profile)
        }
      })
      .catch((error) => {
        console.error('Failed to load public user profile:', error)

        if (isMounted) {
          setUser(null)
          setLoadError(getReadableProfileError(error))
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [userId])

  const isViewingOwnProfile = Boolean(session?.userId && user?.id && session.userId === user.id)

  function handleBack() {
    if (window.history.length > 1) {
      window.history.back()
      return
    }

    route('/listings')
  }

  function handleOpenReportDialog() {
    if (isViewingOwnProfile) {
      return
    }

    const currentSession = readAuthSession()

    if (!currentSession) {
      route(`/login?returnTo=${encodeURIComponent(getCurrentPath())}`)
      return
    }

    setIsReportDialogOpen(true)
  }

  async function handleCreateViolationReport(payload: CreateViolationReportPayload) {
    const currentSession = readAuthSession()

    if (!currentSession) {
      route(`/login?returnTo=${encodeURIComponent(getCurrentPath())}`)
      throw new Error('To report a user, please log in first.')
    }

    if (currentSession.userId === user?.id) {
      throw new Error('You cannot report your own profile.')
    }

    await createViolationReport(payload, currentSession.token, currentSession.type)

    showToast('The user report has been sent to moderation.', 'success')
  }

  if (isLoading) {
    return (
      <section class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
        <div class="card border border-base-300 bg-base-100 shadow-sm">
          <div class="card-body items-start gap-3">
            <span class="loading loading-spinner loading-md" aria-hidden="true" />
            <p class="text-sm text-base-content/70">Loading user profile...</p>
          </div>
        </div>
      </section>
    )
  }

  if (!user) {
    return (
      <section class="flex h-full w-full flex-col items-center justify-center px-4 py-12">
        <EmptyStateContent
          icon="👤"
          titleAs="h1"
          title="User profile not found"
          description={loadError ?? 'We could not find the user profile you are looking for.'}
        >
          <AppButton variant="outline" onClick={handleBack}>
            Go back
          </AppButton>

          <AppButton onClick={() => route('/listings')}>Back to listings</AppButton>
        </EmptyStateContent>
      </section>
    )
  }

  return (
    <section class="mx-auto flex w-full max-w-4xl flex-1 flex-col gap-5 px-4 py-6 md:px-6 md:py-8">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <AppButton variant="ghost" className="btn-sm" onClick={handleBack}>
          ← Back
        </AppButton>

        {isViewingOwnProfile ? (
          <span class="badge badge-neutral badge-outline">This is your public profile</span>
        ) : (
          <AppButton variant="outline" className="btn-sm" onClick={handleOpenReportDialog}>
            Report user
          </AppButton>
        )}
      </div>

      <ReportViolationDialog
        isOpen={isReportDialogOpen}
        targetId={user.id}
        targetType="USER"
        targetLabel={getProfileDisplayName(user)}
        onClose={() => setIsReportDialogOpen(false)}
        onSubmit={handleCreateViolationReport}
      />

      <PublicUserProfileCard user={user} />
    </section>
  )
}