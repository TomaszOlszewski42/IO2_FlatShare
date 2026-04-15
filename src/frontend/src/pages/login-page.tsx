import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'

import { AuthCard } from '../components/layout/auth-card'
import { AppButton } from '../components/ui/app-button'
import { TextInput } from '../components/ui/text-input'
import { persistAuthSession } from '../services/auth-session'
import { login } from '../services/auth-api'
import { AuthCardFooterLink } from '../components/auth/auth-card-footer-link'

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
        roles: session.roles,
      })
      route('/listings')
    } catch (error) {
      handleError(error, 'Login failed. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Log in"
      subtitle="Access your FlatShare account."
      footer={
        <AuthCardFooterLink
          prompt="Don&apos;t have an account?"
          actionLabel="Register"
          href="/register"
        />
      }
    >
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
    </AuthCard>
  )
}