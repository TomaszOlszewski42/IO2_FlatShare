import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { AppButton } from '../../components/ui/app-button'

export function PaymentCancelPage(_: RoutableProps) {
  return (
    <section class="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-6 px-4 py-6 md:px-6 md:py-8">
      <div class="text-center">
        <div class="mb-4 flex justify-center">
          <div class="rounded-full bg-warning/20 p-6">
            <svg
              class="h-12 w-12 text-warning"
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
        </div>
        <h1 class="text-3xl font-bold tracking-tight">Payment Cancelled</h1>
        <p class="mt-2 text-lg text-base-content/70">
          Your payment was cancelled. Your booking is still pending payment.
        </p>
      </div>

      <div class="w-full max-w-sm rounded-lg border border-base-300 bg-base-100 p-6">
        <div class="space-y-4">
          <div>
            <p class="text-sm font-medium text-base-content/70">What happens now?</p>
            <p class="mt-1 text-base">
              Your booking remains in pending payment status. You can try to pay again from your bookings page.
            </p>
          </div>
        </div>
      </div>

      <div class="flex flex-col gap-3 sm:flex-row">
        <AppButton
          onClick={() => route('/bookings')}
          className="btn-primary"
        >
          Return to Bookings
        </AppButton>
        <AppButton
          onClick={() => route('/')}
          className="btn-ghost"
        >
          Back to Home
        </AppButton>
      </div>
    </section>
  )
}
