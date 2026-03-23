import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import { AppButton } from '../components/ui/app-button'
import { TextInput } from '../components/ui/text-input'
import { register } from '../services/auth-api'
import { usePageErrorHandler } from '../services/use-page-error-handler'

export function RegisterPage(_: RoutableProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)

  const { handleError, getFieldError, clearFieldErrors } = usePageErrorHandler({
    captureFieldErrors: true,
  })

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    setGeneralError(null)
    clearFieldErrors()

    try {
      await register({ firstName, lastName, email, password })
      route('/login')
    } catch (error) {
      handleError(error)
      // Check if there are general errors (not field-specific)
      const fieldErr = (error as any)?.response?.errors
      if (!fieldErr) {
        setGeneralError(
          (error as any)?.message || 'Registration failed. Please fix the form and try again.',
        )
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section class="flex w-full flex-1 items-center justify-center py-6">
      <div class="card w-full max-w-md border border-base-300 bg-base-100/85 shadow-lg">
        <div class="card-body">
          <h1 class="card-title text-2xl">Create account</h1>
          <p class="text-sm text-base-content/70">Start your FlatShare journey.</p>

          <form class="mt-4 flex flex-col gap-4" onSubmit={onSubmit}>
            <TextInput
              id="register-first-name"
              name="firstName"
              label="First name"
              type="text"
              value={firstName}
              placeholder="Alex"
              autoComplete="given-name"
              required
              disabled={isSubmitting}
              error={getFieldError('firstName') || getFieldError('firstname') || undefined}
              onInput={(event) => setFirstName((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="register-last-name"
              name="lastName"
              label="Last name"
              type="text"
              value={lastName}
              placeholder="Roommate"
              autoComplete="family-name"
              required
              disabled={isSubmitting}
              error={getFieldError('lastName') || getFieldError('lastname') || undefined}
              onInput={(event) => setLastName((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="register-email"
              name="email"
              label="Email"
              type="email"
              value={email}
              placeholder="you@example.com"
              autoComplete="email"
              required
              disabled={isSubmitting}
              error={getFieldError('email') || undefined}
              onInput={(event) => setEmail((event.currentTarget as HTMLInputElement).value)}
            />

            <TextInput
              id="register-password"
              name="password"
              label="Password"
              type="password"
              value={password}
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
              disabled={isSubmitting}
              error={getFieldError('password') || undefined}
              onInput={(event) => setPassword((event.currentTarget as HTMLInputElement).value)}
            />

            {generalError ? <div class="alert alert-error text-sm">{generalError}</div> : null}

            <AppButton className="mt-2" type="submit" loading={isSubmitting}>
              Register
            </AppButton>
          </form>

          <p class="mt-3 text-sm text-base-content/70">
            Already registered?{' '}
            <a class="link link-primary" href="/login">
              Log in
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
