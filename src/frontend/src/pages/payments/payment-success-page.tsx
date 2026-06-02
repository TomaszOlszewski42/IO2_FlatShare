import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useEffect, useState } from 'preact/hooks'
import { AppButton } from '../../components/ui/app-button'
import { useAuth } from '../../hooks/use-auth'
import { useErrorHandler } from '../../services/error-handler-context'

export function PaymentSuccessPage(_: RoutableProps) {
  const { session } = useAuth()
  const { showToast } = useErrorHandler()
  const [isConfirming, setIsConfirming] = useState(true)
  const [confirmError, setConfirmError] = useState<string | null>(null)

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        // Extract session_id from URL
        const params = new URLSearchParams(window.location.search)
        const sessionId = params.get('session_id')

        if (!sessionId) {
          setConfirmError('Invalid payment session')
          setIsConfirming(false)
          return
        }

        if (!session) {
          route('/login')
          return
        }

        // Confirm payment with server
        const response = await fetch(`/api/v1/payments/confirm?sessionId=${encodeURIComponent(sessionId)}`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.token}`,
          },
        })

        if (!response.ok) {
          const error = await response.text()
          throw new Error(error || 'Failed to confirm payment')
        }

        showToast('Payment confirmed successfully!', 'success')
        setIsConfirming(false)

        // Auto-redirect to bookings after 3 seconds
        const timer = setTimeout(() => {
          route('/bookings')
        }, 3000)

        return () => clearTimeout(timer)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to confirm payment'
        setConfirmError(message)
        setIsConfirming(false)
        showToast(message, 'error')
      }
    }

    void confirmPayment()
  }, [session])

  return (
    <section class="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-6 md:px-6 md:py-8">
      <div class="text-center">
        <div class="mb-4 flex justify-center">
          {isConfirming ? (
            <div class="rounded-full bg-info/20 p-6">
              <div class="h-12 w-12 animate-spin rounded-full border-4 border-info/30 border-t-info" />
            </div>
          ) : confirmError ? (
            <div class="rounded-full bg-error/20 p-6">
              <svg
                class="h-12 w-12 text-error"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
          ) : (
            <div class="rounded-full bg-success/20 p-6">
              <svg
                class="h-12 w-12 text-success"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          )}
        </div>
        <h1 class="text-3xl font-bold tracking-tight">
          {isConfirming ? 'Confirming Payment...' : confirmError ? 'Payment Confirmation Failed' : 'Payment Successful!'}
        </h1>
        <p class="mt-2 text-lg text-base-content/70">
          {isConfirming
            ? 'Please wait while we confirm your payment with the server.'
            : confirmError
              ? `Error: ${confirmError}`
              : 'Your payment has been processed successfully.'}
        </p>
      </div>

      {!isConfirming && !confirmError && (
        <div class="w-full max-w-sm rounded-lg border border-base-300 bg-base-100 p-6">
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-base-content/70">What's next?</p>
              <p class="mt-1 text-base">
                Your booking is now confirmed. You can view the details in your bookings.
              </p>
            </div>
          </div>
        </div>
      )}

      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton
          onClick={() => route('/bookings')}
          className="btn-primary"
          disabled={isConfirming}
        >
          View My Bookings
        </AppButton>
        <AppButton
          onClick={() => route('/')}
          className="btn-ghost"
          disabled={isConfirming}
        >
          Back to Home
        </AppButton>
      </div>

      {!isConfirming && !confirmError && (
        <p class="text-center text-sm text-base-content/50">
          Redirecting to bookings in 3 seconds...
        </p>
      )}
    </section>
  )
}
