import type {
  AuthSession,
  JwtResponse,
  LoginCredentials,
  SignupCredentials,
} from '../../types/auth'
import { authClient } from '../api/http-client'

// ── Storage keys ─────────────────────────────────────────────
const SESSION_KEY = 'expense-tracker.session'
const SESSION_EVENT = 'expense-tracker-session-change'

// ── JWT helpers ──────────────────────────────────────────────

/** Decode a JWT payload without any library. */
function decodeJwtPayload(token: string): Record<string, unknown> {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return JSON.parse(json)
  } catch {
    return {}
  }
}

// ── Session persistence ──────────────────────────────────────

function saveSession(session: AuthSession | null) {
  if (typeof window === 'undefined') return

  if (session) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    localStorage.removeItem(SESSION_KEY)
  }

  window.dispatchEvent(new Event(SESSION_EVENT))
}

function loadSession(): AuthSession | null {
  if (typeof window === 'undefined') return null

  const raw = localStorage.getItem(SESSION_KEY)
  if (!raw) return null

  try {
    const session = JSON.parse(raw) as AuthSession
    if (!session.accessToken || !session.refreshToken || !session.user?.username) {
      localStorage.removeItem(SESSION_KEY)
      return null
    }
    return session
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

// ── Build session from backend response ──────────────────────

function buildSessionFromSignup(
  jwtResponse: JwtResponse,
  credentials: SignupCredentials,
): AuthSession {
  const payload = decodeJwtPayload(jwtResponse.accessToken)
  const username = (payload.sub as string) || credentials.username

  return {
    user: {
      userId: '', // userId is generated server-side, not returned in JWT
      username,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      phoneNumber: credentials.phoneNumber,
    },
    accessToken: jwtResponse.accessToken,
    refreshToken: jwtResponse.token,
  }
}

function buildSessionFromLogin(
  jwtResponse: JwtResponse,
  credentials: LoginCredentials,
): AuthSession {
  const payload = decodeJwtPayload(jwtResponse.accessToken)
  const username = (payload.sub as string) || credentials.username

  // After login the backend only returns tokens — no profile data.
  // We store what we know (username). The profile can be enriched
  // later when a user-service GET endpoint is available.
  return {
    user: {
      userId: '',
      username,
      firstName: '',
      lastName: '',
      email: '',
    },
    accessToken: jwtResponse.accessToken,
    refreshToken: jwtResponse.token,
  }
}

// ── Real Auth Implementation ──────────────────────────────────

const realAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    const { data } = await authClient.post<JwtResponse>('/auth/v1/login', {
      username: credentials.username,
      password: credentials.password,
    })

    const session = buildSessionFromLogin(data, credentials)
    saveSession(session)
    return session
  },

  signup: async (credentials: SignupCredentials): Promise<AuthSession> => {
    // The backend UserInfoDTO uses snake_case JSON naming
    const { data } = await authClient.post<JwtResponse>('/auth/v1/signup', {
      username: credentials.username,
      password: credentials.password,
      first_name: credentials.firstName,
      last_name: credentials.lastName,
      phone_number: credentials.phoneNumber,
      email: credentials.email,
    })

    const session = buildSessionFromSignup(data, credentials)
    saveSession(session)
    return session
  },

  logout: async (): Promise<void> => {
    saveSession(null)
  },

  refreshAccessToken: async (): Promise<AuthSession | null> => {
    const current = loadSession()
    if (!current?.refreshToken) return null

    try {
      const { data } = await authClient.post<JwtResponse>('/auth/v1/refreshToken', {
        token: current.refreshToken,
      })

      const refreshed: AuthSession = {
        ...current,
        accessToken: data.accessToken,
      }

      saveSession(refreshed)
      return refreshed
    } catch {
      saveSession(null)
      return null
    }
  },
}

// ── Mock Auth Implementation ──────────────────────────────────

const MOCK_USERS_KEY = 'expense-tracker.mock-users'

interface MockUser {
  userId: string
  username: string
  password?: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: string
}

const DEFAULT_MOCK_USER: MockUser = {
  userId: 'user-demo',
  username: 'user-demo',
  password: 'password',
  firstName: 'Demo',
  lastName: 'User',
  email: 'demo@example.com',
  phoneNumber: '1234567890',
}

function getMockUsers(): MockUser[] {
  if (typeof window === 'undefined') return [DEFAULT_MOCK_USER]
  const raw = localStorage.getItem(MOCK_USERS_KEY)
  if (!raw) {
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify([DEFAULT_MOCK_USER]))
    return [DEFAULT_MOCK_USER]
  }
  try {
    return JSON.parse(raw) as MockUser[]
  } catch {
    return [DEFAULT_MOCK_USER]
  }
}

function saveMockUser(user: MockUser) {
  const users = getMockUsers()
  users.push(user)
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users))
}

const mockAuthApi = {
  login: async (credentials: LoginCredentials): Promise<AuthSession> => {
    await new Promise((resolve) => setTimeout(resolve, 600)) // latency simulation

    const users = getMockUsers()
    const found = users.find(
      (u) => u.username.toLowerCase() === credentials.username.toLowerCase(),
    )

    if (!found) {
      throw new Error('User not found. Try signing up or using "user-demo".')
    }

    if (found.password && found.password !== credentials.password) {
      throw new Error('Invalid credentials.')
    }

    const session: AuthSession = {
      user: {
        userId: found.userId,
        username: found.username,
        firstName: found.firstName,
        lastName: found.lastName,
        email: found.email,
        phoneNumber: Number(found.phoneNumber),
      },
      accessToken: `mock-header.${btoa(JSON.stringify({ sub: found.username, exp: Date.now() + 3600000 }))}.mock-sig`,
      refreshToken: 'mock-refresh-token',
    }

    saveSession(session)
    return session
  },

  signup: async (credentials: SignupCredentials): Promise<AuthSession> => {
    await new Promise((resolve) => setTimeout(resolve, 800)) // latency simulation

    const users = getMockUsers()
    const exists = users.some(
      (u) => u.username.toLowerCase() === credentials.username.toLowerCase(),
    )

    if (exists) {
      throw new Error('Username already exists.')
    }

    const newUser: MockUser = {
      userId: `mock-user-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      username: credentials.username,
      password: credentials.password,
      firstName: credentials.firstName,
      lastName: credentials.lastName,
      email: credentials.email,
      phoneNumber: String(credentials.phoneNumber),
    }

    saveMockUser(newUser)

    const session: AuthSession = {
      user: {
        userId: newUser.userId,
        username: newUser.username,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        phoneNumber: Number(newUser.phoneNumber),
      },
      accessToken: `mock-header.${btoa(JSON.stringify({ sub: newUser.username, exp: Date.now() + 3600000 }))}.mock-sig`,
      refreshToken: 'mock-refresh-token',
    }

    saveSession(session)
    return session
  },

  logout: async (): Promise<void> => {
    await new Promise((resolve) => setTimeout(resolve, 200))
    saveSession(null)
  },

  refreshAccessToken: async (): Promise<AuthSession | null> => {
    const current = loadSession()
    if (!current) return null

    await new Promise((resolve) => setTimeout(resolve, 300))

    const refreshed: AuthSession = {
      ...current,
      accessToken: `mock-header.${btoa(JSON.stringify({ sub: current.user.username, exp: Date.now() + 3600000 }))}.mock-sig`,
    }

    saveSession(refreshed)
    return refreshed
  },
}

// ── Public Unified auth API ──────────────────────────────────

const isMock = import.meta.env.VITE_USE_MOCK_API === 'true'

export const authApi = {
  loadSession,
  subscribeToSessionChanges: (listener: () => void) => {
    window.addEventListener(SESSION_EVENT, listener)
    return () => window.removeEventListener(SESSION_EVENT, listener)
  },
  login: isMock ? mockAuthApi.login : realAuthApi.login,
  signup: isMock ? mockAuthApi.signup : realAuthApi.signup,
  logout: isMock ? mockAuthApi.logout : realAuthApi.logout,
  refreshAccessToken: isMock ? mockAuthApi.refreshAccessToken : realAuthApi.refreshAccessToken,
}