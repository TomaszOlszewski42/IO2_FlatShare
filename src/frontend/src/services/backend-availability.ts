const BACKEND_UNAVAILABLE_EVENT = 'flatshare-backend-unavailable'
const BACKEND_AVAILABLE_EVENT = 'flatshare-backend-available'
const OUTAGE_STATUS_CODES = new Set([502, 503, 504])

let backendUnavailable = false

function dispatchBackendEvent(name: string) {
  window.dispatchEvent(new CustomEvent(name))
}

export function getBackendUnavailableEventName(): string {
  return BACKEND_UNAVAILABLE_EVENT
}

export function getBackendAvailableEventName(): string {
  return BACKEND_AVAILABLE_EVENT
}

export function isBackendUnavailable(): boolean {
  return backendUnavailable
}

export function markBackendUnavailable() {
  if (backendUnavailable) {
    return
  }

  backendUnavailable = true
  dispatchBackendEvent(BACKEND_UNAVAILABLE_EVENT)
}

export function markBackendAvailable() {
  if (!backendUnavailable) {
    return
  }

  backendUnavailable = false
  dispatchBackendEvent(BACKEND_AVAILABLE_EVENT)
}

export async function probeBackendAvailability(): Promise<boolean> {
  try {
    const response = await fetch('/api/v1', {
      method: 'GET',
      cache: 'no-store',
    })

    if (OUTAGE_STATUS_CODES.has(response.status)) {
      markBackendUnavailable()
      return false
    }

    markBackendAvailable()
    return true
  } catch {
    markBackendUnavailable()
    return false
  }
}
