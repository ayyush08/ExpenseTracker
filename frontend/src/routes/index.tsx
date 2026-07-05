import { Navigate, createFileRoute } from '@tanstack/react-router'

import { useAuth } from '../hooks/use-auth'

export const Route = createFileRoute('/')({ component: HomeRedirect })

function HomeRedirect() {
  const { status, isAuthenticated } = useAuth()

  if (status === 'loading') {
    return (
      <main className="page-wrap flex min-h-[60vh] items-center justify-center px-4 py-16">
        <section className="island-shell rounded-4xl px-6 py-8 text-center text-sm text-(--sea-ink-soft)">
          Checking your session...
        </section>
      </main>
    )
  }

  return <Navigate to={isAuthenticated ? '/app' : '/login'} replace />
}
