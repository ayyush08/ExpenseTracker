import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { AuthShell } from '../components/layouts/auth-shell'
import { loginSchema } from '../features/auth/auth.schemas'
import type { LoginFormValues } from '../features/auth/auth.schemas'
import { useAuth } from '../hooks/use-auth'

export const Route = createFileRoute('/login')({ component: LoginPage })

function LoginPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'demo@expensetracker.app',
      password: 'password123',
    },
  })

  async function handleSubmit(values: LoginFormValues) {
    setError(null)

    try {
      await login(values)
      navigate({ to: '/app', replace: true })
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to sign in.')
    }
  }

  const { register, handleSubmit: handleFormSubmit, formState } = form
  const isSubmitting = formState.isSubmitting

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Sign in to your Expense Tracker workspace"
      description="Use the mock auth layer today and swap in the Spring Boot API later without touching the route structure."
    >
      <form className="space-y-5" onSubmit={handleFormSubmit(handleSubmit)} noValidate>
        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="demo@expensetracker.app"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('email')}
          />
          {formState.errors.email ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-(--sea-ink)" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="password123"
            className="w-full rounded-2xl border border-(--line) bg-white/70 px-4 py-3 text-sm text-(--sea-ink) outline-none transition focus:border-(--lagoon-deep) focus:ring-2 focus:ring-[rgba(79,184,178,0.18)]"
            {...register('password')}
          />
          {formState.errors.password ? (
            <p className="m-0 text-sm text-[rgb(138,36,36)]">
              {formState.errors.password.message}
            </p>
          ) : null}
        </div>

        {error ? (
          <p className="rounded-2xl border border-[rgba(180,65,65,0.2)] bg-[rgba(180,65,65,0.08)] px-4 py-3 text-sm text-[rgb(138,36,36)]">
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center rounded-full bg-(--lagoon) px-5 py-3 text-sm font-semibold text-white transition hover:bg-(--lagoon-deep) disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </button>

        <p className="text-sm text-(--sea-ink-soft)">
          Demo account: demo@expensetracker.app / password123
        </p>
        <p className="text-sm text-(--sea-ink-soft)">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-(--lagoon-deep)">
            Create an account
          </Link>
        </p>
      </form>
    </AuthShell>
  )
}