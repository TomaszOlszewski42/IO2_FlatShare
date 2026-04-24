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

function formatDraftTimestamp(value: string | null): string | null {
  if (!value) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date.toLocaleString('pl-PL')
}

export function TenantPreferencesPage(_: RoutableProps) {
  const [preferences, setPreferences] = useState<TenantPreferences>(createEmptyTenantPreferences())
  const [previewPreferences, setPreviewPreferences] = useState<TenantPreferences>(createEmptyTenantPreferences())
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [draftMessage, setDraftMessage] = useState<string | null>(null)
  const [isAllowed, setIsAllowed] = useState<boolean>(() => canAccessTenantPreferences())
  const [hasRecoveredDraft, setHasRecoveredDraft] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)

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
        setHasRecoveredDraft(Boolean(savedDraft))
        setDraftSavedAt(savedDraft?.updatedAt ?? null)

        if (savedDraft?.updatedAt) {
          const formattedTimestamp = formatDraftTimestamp(savedDraft.updatedAt)
          setDraftMessage(
            formattedTimestamp
              ? `Przywrócono lokalny szkic zapisany ${formattedTimestamp}.`
              : 'Przywrócono lokalny szkic preferencji.',
          )
        } else {
          setDraftMessage(null)
        }
      } catch (error) {
        console.error('Failed to load tenant preferences:', error)

        if (!isMounted) {
          return
        }

        if (savedDraft?.values) {
          const mergedPreferences = mergeTenantPreferences(createEmptyTenantPreferences(), savedDraft.values)

          setPreferences(mergedPreferences)
          setPreviewPreferences(mergedPreferences)
          setHasRecoveredDraft(true)
          setDraftSavedAt(savedDraft.updatedAt)

          const formattedTimestamp = formatDraftTimestamp(savedDraft.updatedAt)
          setDraftMessage(
            formattedTimestamp
              ? `Nie udało się pobrać zapisanych preferencji. Przywrócono lokalny szkic z ${formattedTimestamp}.`
              : 'Nie udało się pobrać zapisanych preferencji. Przywrócono lokalny szkic.',
          )
          setErrorMessage(null)
        } else {
          const emptyPreferences = createEmptyTenantPreferences()
          setPreferences(emptyPreferences)
          setPreviewPreferences(emptyPreferences)
          setErrorMessage('Nie udało się wczytać preferencji. Możesz nadal uzupełnić formularz ręcznie.')
          setDraftMessage(null)
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

    const updatedAt = saveTenantPreferencesDraft(values)

    if (updatedAt) {
      setDraftSavedAt(updatedAt)

      const formattedTimestamp = formatDraftTimestamp(updatedAt)
      setDraftMessage(
        formattedTimestamp ? `Lokalny szkic zapisano ${formattedTimestamp}.` : 'Lokalny szkic został zapisany.',
      )
    }
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
      setHasRecoveredDraft(false)
      setDraftSavedAt(null)
      setDraftMessage(null)
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

        <div class="alert alert-info mb-6 text-sm">
          <span>
            Na obecnym etapie developmentu te dane są zapisywane lokalnie w przeglądarce. Widok jest przygotowany pod
            późniejsze podpięcie backendu.
          </span>
        </div>

        {hasRecoveredDraft && draftMessage ? <div class="alert alert-warning mb-6 text-sm">{draftMessage}</div> : null}

        {!hasRecoveredDraft && draftMessage ? <div class="alert alert-info mb-6 text-sm">{draftMessage}</div> : null}

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
                {draftSavedAt ? (
                  <div class="mb-2 text-xs text-base-content/60">
                    Ostatni lokalny zapis: {formatDraftTimestamp(draftSavedAt) || 'przed chwilą'}
                  </div>
                ) : null}

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