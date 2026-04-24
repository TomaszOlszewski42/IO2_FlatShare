import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useRef, useState } from 'preact/hooks'

import { TenantPreferencesForm } from '../components/preferences/tenant-preferences-form'
import { TenantPreferencesSummary } from '../components/preferences/tenant-preferences-summary'
import { readAuthSession } from '../services/auth-session'
import {
  clearTenantPreferencesDraft,
  readTenantPreferencesDraft,
  saveTenantPreferencesDraft,
} from '../services/tenant-preferences-draft'
import { getTenantPreferences, updateTenantPreferences } from '../services/tenant-preferences-api'
import { createEmptyTenantPreferences, type TenantPreferences } from '../types/tenant-preferences'

function canAccessTenantPreferences(): boolean {
  const session = readAuthSession()

  if (!session) {
    return false
  }

  return session.roles.includes('TENANT')
}

function mergeTenantPreferences(base: TenantPreferences, override?: TenantPreferences | null): TenantPreferences {
  if (!override) {
    return base
  }

  return {
    maxPrice: override.maxPrice,
    currency: override.currency,
    smokingAllowed: override.smokingAllowed,
    petsAllowed: override.petsAllowed,
    preferredDistricts: override.preferredDistricts,
  }
}

export function TenantPreferencesPage(_: RoutableProps) {
  const [preferences, setPreferences] = useState<TenantPreferences>(createEmptyTenantPreferences())
  const [previewPreferences, setPreviewPreferences] = useState<TenantPreferences>(createEmptyTenantPreferences())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [isAllowed, setIsAllowed] = useState<boolean>(() => canAccessTenantPreferences())

  const hasSkippedInitialDraftSave = useRef(false)

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

      const savedDraft = readTenantPreferencesDraft()

      try {
        const result = await getTenantPreferences()

        if (!isMounted) {
          return
        }

        const mergedPreferences = mergeTenantPreferences(result, savedDraft?.values ?? null)

        setPreferences(mergedPreferences)
        setPreviewPreferences(mergedPreferences)
      } catch (error) {
        console.error('Failed to load tenant preferences:', error)

        if (!isMounted) {
          return
        }

        if (savedDraft?.values) {
          const mergedPreferences = mergeTenantPreferences(createEmptyTenantPreferences(), savedDraft.values)

          setPreferences(mergedPreferences)
          setPreviewPreferences(mergedPreferences)
          setErrorMessage(null)
        } else {
          const emptyPreferences = createEmptyTenantPreferences()
          setPreferences(emptyPreferences)
          setPreviewPreferences(emptyPreferences)
          setErrorMessage('Nie udało się wczytać preferencji. Możesz nadal uzupełnić formularz ręcznie.')
        }
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

  function handleFormChange(values: TenantPreferences) {
    setPreviewPreferences(values)

    if (!hasSkippedInitialDraftSave.current) {
      hasSkippedInitialDraftSave.current = true
      return
    }

    saveTenantPreferencesDraft(values)
  }

  async function handleSubmit(values: TenantPreferences) {
    setIsSubmitting(true)
    setErrorMessage(null)
    setSaveMessage(null)

    try {
      const savedPreferences = await updateTenantPreferences(values)
      setPreferences(savedPreferences)
      setPreviewPreferences(savedPreferences)
      setSaveMessage('Preferencje zostały zapisane.')
      clearTenantPreferencesDraft()
    } catch (error) {
      console.error('Failed to save tenant preferences:', error)
      setErrorMessage('Nie udało się zapisać preferencji.')
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
          <h1 class="mb-2 text-3xl font-bold">Preferencje lokatora</h1>
          <p class="text-base-content/70">
            Ustaw preferencje, które w kolejnych sprintach będą wykorzystywane do dopasowywania mieszkań.
          </p>
        </div>

        {errorMessage ? <div class="alert alert-error mb-6 text-sm">{errorMessage}</div> : null}

        {isLoading ? (
          <div class="card border border-base-300 bg-base-100 shadow-sm">
            <div class="card-body items-start gap-3">
              <span class="loading loading-spinner loading-md" aria-hidden="true" />
              <p class="text-sm text-base-content/70">Wczytywanie preferencji...</p>
            </div>
          </div>
        ) : (
          <>
            <TenantPreferencesSummary preferences={previewPreferences} />

            <div class="card border border-base-300 bg-base-100 shadow-sm">
              <div class="card-body">
                {/*
                Debug only:
                lokalny draft nadal działa w tle przez tenant-preferences-draft,
                ale nie pokazujemy już komunikatów o szkicu użytkownikowi.
                */}

                <TenantPreferencesForm
                  initialValues={preferences}
                  isSubmitting={isSubmitting}
                  saveMessage={saveMessage}
                  onChange={handleFormChange}
                  onSubmit={handleSubmit}
                />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}