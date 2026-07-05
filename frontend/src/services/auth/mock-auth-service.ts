import type {
  AuthSession,
  AuthUser,
  ChangePasswordInput,
  LoginCredentials,
  SignupCredentials,
  UpdateProfileInput,
} from '../../types/auth'

type StoredAuthUser = AuthUser & { password: string }

const SESSION_KEY = 'expense-tracker.session'
const USERS_KEY = 'expense-tracker.users'
const SESSION_EVENT = 'expense-tracker-session-change'

const DEFAULT_USERS: StoredAuthUser[] = [
  {
    id: 'user-demo',
    fullName: 'Alex Morgan',
    email: 'demo@expensetracker.app',
    password: 'password123',
    role: 'admin',
    currency: 'USD',
    monthlyBudget: 3250,
    createdAt: '2026-01-08T09:00:00.000Z',
  },
]

function cloneUser(user: StoredAuthUser): AuthUser {
  const { password: _password, ...publicUser } = user
  return publicUser
}

function getStorage(): Storage | null {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage
}

function readUsers(): StoredAuthUser[] {
  const storage = getStorage()
  if (!storage) {
    return DEFAULT_USERS
  }

  const rawUsers = storage.getItem(USERS_KEY)
  if (!rawUsers) {
    storage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
    return DEFAULT_USERS
  }

  try {
    const parsedUsers = JSON.parse(rawUsers) as StoredAuthUser[]
    return Array.isArray(parsedUsers) && parsedUsers.length > 0
      ? parsedUsers
      : DEFAULT_USERS
  } catch {
    storage.setItem(USERS_KEY, JSON.stringify(DEFAULT_USERS))
    return DEFAULT_USERS
  }
}

function writeUsers(users: StoredAuthUser[]) {
  const storage = getStorage()
  if (!storage) {
    return
  }

  storage.setItem(USERS_KEY, JSON.stringify(users))
}

function createSession(user: AuthUser): AuthSession {
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 12).toISOString()

  return {
    user,
    token: `mock-${user.id}-${Date.now()}`,
    expiresAt,
  }
}

function saveSession(session: AuthSession | null) {
  const storage = getStorage()
  if (!storage) {
    return
  }

  if (session) {
    storage.setItem(SESSION_KEY, JSON.stringify(session))
  } else {
    storage.removeItem(SESSION_KEY)
  }

  window.dispatchEvent(new Event(SESSION_EVENT))
}

export function loadSession(): AuthSession | null {
  const storage = getStorage()
  if (!storage) {
    return null
  }

  const rawSession = storage.getItem(SESSION_KEY)
  if (!rawSession) {
    return null
  }

  try {
    const parsedSession = JSON.parse(rawSession) as AuthSession
    if (!parsedSession.user.id) {
      storage.removeItem(SESSION_KEY)
      return null
    }

    if (Date.now() > Date.parse(parsedSession.expiresAt)) {
      storage.removeItem(SESSION_KEY)
      window.dispatchEvent(new Event(SESSION_EVENT))
      return null
    }

    return parsedSession
  } catch {
    storage.removeItem(SESSION_KEY)
    return null
  }
}

export function signIn(credentials: LoginCredentials): AuthSession {
  const normalizedEmail = credentials.email.trim().toLowerCase()
  const users = readUsers()
  const matchedUser = users.find((user) => user.email === normalizedEmail)

  if (!matchedUser || matchedUser.password !== credentials.password) {
    throw new Error('Invalid email or password.')
  }

  const session = createSession(cloneUser(matchedUser))
  saveSession(session)
  window.dispatchEvent(new Event(SESSION_EVENT))

  return session
}

export function signUp(credentials: SignupCredentials): AuthSession {
  const normalizedEmail = credentials.email.trim().toLowerCase()
  const users = readUsers()

  if (users.some((user) => user.email === normalizedEmail)) {
    throw new Error('An account with this email already exists.')
  }

  const user: StoredAuthUser = {
    id: `user-${Date.now()}`,
    fullName: credentials.fullName.trim(),
    email: normalizedEmail,
    password: credentials.password,
    role: 'user',
    currency: 'USD',
    monthlyBudget: 2500,
    createdAt: new Date().toISOString(),
  }

  const nextUsers = [...users, user]
  writeUsers(nextUsers)

  const session = createSession(cloneUser(user))
  saveSession(session)
  window.dispatchEvent(new Event(SESSION_EVENT))

  return session
}

export function signOut() {
  saveSession(null)
}

export function updateProfile(input: UpdateProfileInput): AuthSession {
  const session = loadSession()

  if (!session) {
    throw new Error('You need to sign in again.')
  }

  const users = readUsers()
  const updatedUsers = users.map((user) =>
    user.id === session.user.id
      ? {
          ...user,
          fullName: input.fullName.trim(),
          email: input.email.trim().toLowerCase(),
          currency: input.currency,
          monthlyBudget: input.monthlyBudget,
        }
      : user,
  )

  const updatedUser = updatedUsers.find((user) => user.id === session.user.id)
  if (!updatedUser) {
    throw new Error('Unable to update profile.')
  }

  writeUsers(updatedUsers)

  const nextSession = createSession(cloneUser(updatedUser))
  saveSession(nextSession)
  window.dispatchEvent(new Event(SESSION_EVENT))

  return nextSession
}

export function changePassword(input: ChangePasswordInput) {
  const session = loadSession()

  if (!session) {
    throw new Error('You need to sign in again.')
  }

  const users = readUsers()
  const targetUser = users.find((user) => user.id === session.user.id)

  if (!targetUser || targetUser.password !== input.currentPassword) {
    throw new Error('Current password is incorrect.')
  }

  const updatedUsers = users.map((user) =>
    user.id === session.user.id
      ? {
          ...user,
          password: input.newPassword,
        }
      : user,
  )

  writeUsers(updatedUsers)
}

export function onSessionStorageChange(listener: () => void) {
  window.addEventListener(SESSION_EVENT, listener)

  return () => {
    window.removeEventListener(SESSION_EVENT, listener)
  }
}