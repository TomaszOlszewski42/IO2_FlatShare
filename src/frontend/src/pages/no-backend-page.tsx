import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useMemo, useRef, useState } from 'preact/hooks'

import { AppButton } from '../components/ui/app-button'
import { probeBackendAvailability } from '../services/backend-availability'

const CHECK_INTERVAL_MS = 3000

function resolveReturnPath(): string {
  const returnTo = new URLSearchParams(window.location.search).get('returnTo')

  if (!returnTo || !returnTo.startsWith('/')) {
    return '/'
  }

  return returnTo
}

export function NoBackendPage(_: RoutableProps) {
  const returnPath = useMemo(() => resolveReturnPath(), [])
  const [isChecking, setIsChecking] = useState(false)
  const [isRecovered, setIsRecovered] = useState(false)
  const [lastCheckedAt, setLastCheckedAt] = useState<Date | null>(null)
  const checkInProgressRef = useRef(false)

  async function checkNow() {
    if (checkInProgressRef.current || isRecovered) {
      return
    }

    checkInProgressRef.current = true
    setIsChecking(true)

    const isAvailable = await probeBackendAvailability()

    setLastCheckedAt(new Date())
    setIsChecking(false)
    checkInProgressRef.current = false

    if (isAvailable) {
      setIsRecovered(true)
      route(returnPath, true)
    }
  }

  useEffect(() => {
    void checkNow()

    const intervalId = window.setInterval(() => {
      void checkNow()
    }, CHECK_INTERVAL_MS)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [returnPath])

  const lastCheckedLabel =
    lastCheckedAt === null
      ? 'No checks performed yet.'
      : `Last check: ${lastCheckedAt.toLocaleTimeString()}`

  return (
    <section class="flex w-full flex-1 items-center justify-center py-8">
      <div class="card w-full max-w-xl border border-warning/40 bg-base-100/90 shadow-xl">
        <div class="card-body gap-4">
          <h1 class="text-3xl font-bold text-warning">Backend unavailable</h1>
          <p class="text-base-content/80">
            We cannot reach the backend right now. We will keep checking automatically and send you
            back as soon as the service is restored.
          </p>
          <p class="text-sm text-base-content/60">{lastCheckedLabel}</p>

          <div class="mt-2 flex flex-wrap items-center gap-3">
            <AppButton type="button" loading={isChecking} onClick={() => void checkNow()}>
              Retry now
            </AppButton>
            <span class="text-sm text-base-content/70">Auto-check interval: 3 seconds</span>
          </div>
        </div>
      </div>
    </section>
  )
}
