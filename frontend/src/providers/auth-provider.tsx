import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import type { AuthSession, AuthUser, LoginCredentials, SignupCredentials } from '../types/auth'
import { authApi } from '../services/auth/auth-api'

type AuthStatus = 'loading' | 'ready'

type AuthContextValue = {
  status: AuthStatus
  session: AuthSession | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthSession>
  signup: (credentials: SignupCredentials) => Promise<AuthSession>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ── Proactive token refresh ──────────────────────────────────
// The backend JWT expires in 60 s. We schedule a refresh 10 s
// before expiry so protected requests never see a 401 under
// normal circumstances. The HTTP-client interceptor is the
// safety-net fallback.
// ──────────────────────────────────────────────────────────────

function decodeExp(token: string): number | null {
  try {
    const payload = JSON.parse(
      atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
    )
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Schedule proactive refresh ─────────────────────────────
  const scheduleRefresh = useCallback((accessToken: string) => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current)
      refreshTimerRef.current = null
    }

    const exp = decodeExp(accessToken)
    if (!exp) return

    // Refresh 10 s before expiry (minimum 5 s from now)
    const msUntilExpiry = exp * 1000 - Date.now()
    const refreshIn = Math.max(msUntilExpiry - 10_000, 5_000)

    refreshTimerRef.current = setTimeout(async () => {
      const refreshed = await authApi.refreshAccessToken()
      if (refreshed) {
        setSession(refreshed)
        scheduleRefresh(refreshed.accessToken)
      } else {
        // Refresh failed — session expired
        setSession(null)
      }
    }, refreshIn)
  }, [])

  // ── Hydrate from storage on mount ──────────────────────────
  useEffect(() => {
    const stored = authApi.loadSession()
    setSession(stored)
    setStatus('ready')

    if (stored?.accessToken) {
      scheduleRefresh(stored.accessToken)
    }
  }, [scheduleRefresh])

  // ── Listen for cross-tab session changes ───────────────────
  useEffect(() => {
    return authApi.subscribeToSessionChanges(() => {
      const latest = authApi.loadSession()
      setSession(latest)
      setStatus('ready')

      if (latest?.accessToken) {
        scheduleRefresh(latest.accessToken)
      }
    })
  }, [scheduleRefresh])

  // ── Cleanup timer on unmount ───────────────────────────────
  useEffect(() => {
    return () => {
      if (refreshTimerRef.current) {
        clearTimeout(refreshTimerRef.current)
      }
    }
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      isAuthenticated: Boolean(session),
      login: async (credentials) => {
        const nextSession = await authApi.login(credentials)
        setSession(nextSession)
        scheduleRefresh(nextSession.accessToken)
        return nextSession
      },
      signup: async (credentials) => {
        const nextSession = await authApi.signup(credentials)
        setSession(nextSession)
        scheduleRefresh(nextSession.accessToken)
        return nextSession
      },
      logout: async () => {
        if (refreshTimerRef.current) {
          clearTimeout(refreshTimerRef.current)
          refreshTimerRef.current = null
        }
        await authApi.logout()
        setSession(null)
      },
    }),
    [session, status, scheduleRefresh],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}