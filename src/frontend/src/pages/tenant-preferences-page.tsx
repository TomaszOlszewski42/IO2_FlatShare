import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'

import { TenantPreferencesForm } from '../components/preferences/tenant-preferences-form'
import { createEmptyTenantPreferences, type TenantPreferences } from '../types/tenant-preferences'
import { getTenantPreferences, updateTenantPreferences } from '../services/tenant-preferences-api'
import { readAuthSession } from '../services/auth-session'

function canAccessTenantPreferences(): boolean {
  const session = readAuthSession()

  if (!session) {
    return false
  }

  return session.roles.includes('TENANT')
}

export function TenantPreferencesPage(_: RoutableProps) {
  const [preferences, setPreferences] = useState<TenantPreferences>(createEmptyTenantPreferences())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isAllowed, setIsAllowed] = useState<boolean>(() => canAccessTenantPreferences())

  useEffect(() => {
    const session = readAuthSession()

    if (!session) {
      route('/login', true)
      return
    }

    if (!session.roles.includes('TENANT')) {
      route('/', true)
      return
    }

    setIsAllowed(true)
  }, [])

  useEffect(() => {
    if (!isAllowed) {
      return
    }

    let isMounted = true

    async function loadPreferences() {
      setIsLoading(true)
      setErrorMessage(null)

      try {
        const result = await getTenantPreferences()

        if (!isMounted) {
          return
        }

        setPreferences(result)
      } catch (error) {
        console.error('Failed to load tenant preferences:', error)

        if (!isMounted) {
          return
        }

        setErrorMessage('Could not load your preferences.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void loadPreferences()

    return () => {
      isMounted = false
    }
  }, [isAllowed])

  async function handleSubmit(values: TenantPreferences) {
    setIsSubmitting(true)
    setErrorMessage(null)
    setSaveMessage(null)

    try {
      const savedPreferences = await updateTenantPreferences(values)
      setPreferences(savedPreferences)
      setSaveMessage('Preferences saved locally in the current frontend development version.')
    } catch (error) {
      console.error('Failed to save tenant preferences:', error)
      setErrorMessage('Could not save your preferences.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isAllowed) {
    return null
  }

  return (
    <div class="flex w-full flex-1 flex-col py-6">
      <div class="container mx-auto max-w-3xl px-4">
        <div class="mb-6">
          <h1 class="mb-2 text-3xl font-bold">Tenant preferences</h1>
          <p class="text-base-content/70">
            Set the preferences that will later be used for matching you with suitable listings.
          </p>
        </div>

        {/* TODO BACKEND DELETE ME */}
        <div class="alert alert-info mb-6 text-sm">
          <span>
            This screen is frontend-ready, but it does not use the backend yet. For now, preferences are stored only in
            your browser.
          </span>
        </div>

        {errorMessage ? <div class="alert alert-error mb-6 text-sm">{errorMessage}</div> : null}

        {isLoading ? (
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body">
              <span class="loading loading-spinner loading-md" aria-hidden="true" />
              <p class="text-sm text-base-content/70">Loading preferences...</p>
            </div>
          </div>
        ) : (
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body">
              <TenantPreferencesForm
                initialValues={preferences}
                isSubmitting={isSubmitting}
                saveMessage={saveMessage}
                onSubmit={handleSubmit}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}