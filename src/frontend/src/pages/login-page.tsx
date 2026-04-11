import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'

import { AppButton } from '../components/ui/app-button'
import { TextInput } from '../components/ui/text-input'
import { persistAuthSession } from '../services/auth-session'
import { login } from '../services/auth-api'

import { FormErrorSummary } from '../components/forms/form-error-summary'

export function LoginPage(_: RoutableProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { errorMessage, fieldErrors, clearErrors, handleError } = usePageErrorHandler()

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    clearErrors()

    try {
      const session = await login({ email, password })
      persistAuthSession({
        token: session.token,
        sessionId: session.sessionId,
        type: session.type,
      })
      route('/')
    } catch (error) {
      handleError(error, 'Login failed. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section class="flex w-full flex-1 items-center justify-center py-6">
      <div class="card w-full max-w-md border border-base-300 bg-base-100/85 shadow-lg">
        <div class="card-body">
          <h1 class="card-title text-2xl">Log in</h1>
          <p class="text-sm text-base-content/70">Access your FlatShare account.</p>

          <form class="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
            <TextInput
              id="login-email"
              name="email"
              label="Email"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              errors={fieldErrors.email}
              onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="login-password"
              name="password"
              label="Password"
              type="password"
              value={password}
              placeholder="********"
              autoComplete="current-password"
              required
              disabled={isSubmitting}
              errors={fieldErrors.password}
              onInput={(event) => setPassword((event.currentTarget as HTMLInputElement).value)}
            />

            <FormErrorSummary error={errorMessage} />

            <AppButton className="mt-2" type="submit" loading={isSubmitting}>
              Log in
            </AppButton>

            <button
              class="link link-primary w-fit text-left"
              type="button"
              onClick={() => route('/password-reset/request')}
            >
              Forgot password?
            </button>
          </form>

          <p class="mt-3 text-sm text-base-content/70">
            Don&apos;t have an account?{' '}
            <button
              class="link link-primary"
              type="button"
              onClick={() => route('/register')}
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </section>
  )
}