import { createFileRoute, Outlet } from '@tanstack/react-router'

import { AppShell } from '../components/layouts/app-shell'
import { ProtectedRoute } from '../components/auth/protected-route'

export const Route = createFileRoute('/app')({ component: AppRoute })

function AppRoute() {
  return (
    <ProtectedRoute>
      <AppShell>
        <Outlet />
      </AppShell>
    </ProtectedRoute>
  )
}