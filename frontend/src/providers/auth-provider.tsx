import { createContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

import type {
  AuthSession,
  AuthUser,
  ChangePasswordInput,
  LoginCredentials,
  SignupCredentials,
  UpdateProfileInput,
} from '../types/auth'
import {
  authApi,
} from '../services/auth/auth-api'

type AuthStatus = 'loading' | 'ready'

type AuthContextValue = {
  status: AuthStatus
  session: AuthSession | null
  user: AuthUser | null
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<AuthSession>
  signup: (credentials: SignupCredentials) => Promise<AuthSession>
  logout: () => Promise<void>
  updateUserProfile: (input: UpdateProfileInput) => Promise<AuthSession>
  updatePassword: (input: ChangePasswordInput) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined,
)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    setSession(authApi.loadSession())
    setStatus('ready')
  }, [])

  useEffect(() => {
    return authApi.subscribeToSessionChanges(() => {
      setSession(authApi.loadSession())
      setStatus('ready')
    })
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
        return nextSession
      },
      signup: async (credentials) => {
        const nextSession = await authApi.signup(credentials)
        setSession(nextSession)
        return nextSession
      },
      logout: async () => {
        await authApi.logout()
        setSession(null)
      },
      updateUserProfile: async (input) => {
        const nextSession = await authApi.updateProfile(input)
        setSession(nextSession)
        return nextSession
      },
      updatePassword: async (input) => {
        await authApi.changePassword(input)
      },
    }),
    [session, status],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}