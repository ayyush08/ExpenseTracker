import { Navigate } from '@tanstack/react-router'
import type { ReactNode } from 'react'

import { useAuth } from '../../hooks/use-auth'

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status, isAuthenticated } = useAuth()

  if (status === 'loading') {
    return (
      <div className="page-wrap flex min-h-[55vh] items-center justify-center px-4 py-16 text-center text-sm text-(--sea-ink-soft)">
        Restoring your session...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children
}