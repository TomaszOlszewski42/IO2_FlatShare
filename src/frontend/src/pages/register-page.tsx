import type { RoutableProps } from 'preact-router'
import { route } from 'preact-router'
import { useState } from 'preact/hooks'

import { FormErrorSummary } from '../components/forms/form-error-summary'
import { AuthCard } from '../components/layout/auth-card'
import { AppButton } from '../components/ui/app-button'
import { SelectInput } from '../components/ui/select-input'
import { TextInput } from '../components/ui/text-input'
import { usePageErrorHandler } from '../hooks/use-page-error-handler'
import { register, type RegisterRole } from '../services/auth-api'
import { ApiHttpError } from '../services/api-client'
import { AuthCardFooterLink } from '../components/auth/auth-card-footer-link'

const roleOptions: Array<{ value: RegisterRole; label: string }> = [
  { value: 'TENANT', label: 'Tenant' },
  { value: 'LANDLORD', label: 'Landlord' },
]

export function RegisterPage(_: RoutableProps) {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<RegisterRole>('TENANT')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { errorMessage, fieldErrors, clearErrors, handleError } = usePageErrorHandler()

  async function onSubmit(event: SubmitEvent) {
    event.preventDefault()

    setIsSubmitting(true)
    clearErrors()

    try {
      await register({ firstName, lastName, email, password, role })
      route('/login')
    } catch (error) {
      if (error instanceof ApiHttpError) {
        handleError(error, 'Registration failed. Please fix the form and try again.')
      } else {
        handleError(error, 'Unexpected error while creating your account. Please try again.')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthCard
      title="Create account"
      subtitle="Start your FlatShare journey."
      footer={
        <AuthCardFooterLink
          prompt="Already registered?"
          actionLabel="Log in"
          href="/login"
        />
      }
    >
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
          errors={fieldErrors.firstName}
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
          errors={fieldErrors.lastName}
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
          errors={fieldErrors.email}
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
          errors={fieldErrors.password}
          onInput={(event) => setPassword((event.currentTarget as HTMLInputElement).value)}
        />

        <SelectInput
          id="register-role"
          name="role"
          label="I am registering as"
          value={role}
          options={roleOptions}
          required
          disabled={isSubmitting}
          errors={fieldErrors.role}
          onChange={(event) => setRole((event.currentTarget as HTMLSelectElement).value as RegisterRole)}
        />

        <FormErrorSummary error={errorMessage} />

        <AppButton className="mt-2" type="submit" loading={isSubmitting}>
          Create account
        </AppButton>
      </form>
    </AuthCard>
  )
}