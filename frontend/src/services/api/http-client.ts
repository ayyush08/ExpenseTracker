import axios from 'axios'

// ── Service URL resolution ───────────────────────────────────
// When VITE_API_BASE_URL is set (e.g. Kong gateway), ALL
// requests are routed through that single base.
// When it's empty, each service has its own direct URL.
// To migrate to Kong: set VITE_API_BASE_URL=http://localhost:8000
// ──────────────────────────────────────────────────────────────

const gatewayUrl = import.meta.env.VITE_API_BASE_URL as string | undefined

export const SERVICE_URLS = {
  auth: gatewayUrl || (import.meta.env.VITE_AUTH_SERVICE_URL as string) || 'http://localhost:9898',
  user: gatewayUrl || (import.meta.env.VITE_USER_SERVICE_URL as string) || 'http://localhost:9810',
  expense:
    gatewayUrl || (import.meta.env.VITE_EXPENSE_SERVICE_URL as string) || 'http://localhost:9820',
} as const

// ── Axios instances (one per service) ────────────────────────
// Each instance has its own baseURL but shares the same
// interceptor logic. When migrating to Kong you'll just
// have identical baseURLs — zero code change needed.
// ──────────────────────────────────────────────────────────────

function createClient(baseURL: string) {
  return axios.create({ baseURL, withCredentials: false })
}

export const authClient = createClient(SERVICE_URLS.auth)
export const userClient = createClient(SERVICE_URLS.user)
export const expenseClient = createClient(SERVICE_URLS.expense)

// ── Token storage helpers ────────────────────────────────────

const SESSION_KEY = 'expense-tracker.session'

function readStoredTokens(): { accessToken: string; refreshToken: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (parsed?.accessToken && parsed?.refreshToken) {
      return { accessToken: parsed.accessToken, refreshToken: parsed.refreshToken }
    }
    return null
  } catch {
    return null
  }
}

// ── Request interceptor: attach Bearer token ─────────────────

function attachToken(config: import('axios').InternalAxiosRequestConfig) {
  const stored = readStoredTokens()
  if (stored?.accessToken) {
    config.headers.Authorization = `Bearer ${stored.accessToken}`
  }
  return config
}

// Apply to clients that need auth (user & expense services)
userClient.interceptors.request.use(attachToken)
expenseClient.interceptors.request.use(attachToken)

// ── Response interceptor: silent token refresh ───────────────

let refreshPromise: Promise<string> | null = null

async function silentRefresh(): Promise<string> {
  const stored = readStoredTokens()
  if (!stored?.refreshToken) {
    throw new Error('No refresh token available.')
  }

  // Use authClient directly to avoid interceptor loops
  const { data } = await authClient.post<{ accessToken: string; token: string }>(
    '/auth/v1/refreshToken',
    { token: stored.refreshToken },
  )

  // Persist the new tokens
  const raw = localStorage.getItem(SESSION_KEY)
  if (raw) {
    const session = JSON.parse(raw)
    session.accessToken = data.accessToken
    // refresh token stays the same (backend returns same UUID)
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
    window.dispatchEvent(new Event('expense-tracker-session-change'))
  }

  return data.accessToken
}

function handle401(error: unknown) {
  if (!axios.isAxiosError(error) || error.response?.status !== 401) {
    return Promise.reject(error)
  }

  const originalRequest = error.config
  if (!originalRequest) return Promise.reject(error)

  // Avoid infinite retry loops
  if ((originalRequest as unknown as Record<string, unknown>)._retry) {
    // Refresh also failed — clear session and redirect to login
    localStorage.removeItem(SESSION_KEY)
    window.dispatchEvent(new Event('expense-tracker-session-change'))
    window.location.href = '/login'
    return Promise.reject(error)
  }

  ;(originalRequest as unknown as Record<string, unknown>)._retry = true

  // Deduplicate concurrent refresh calls
  if (!refreshPromise) {
    refreshPromise = silentRefresh().finally(() => {
      refreshPromise = null
    })
  }

  return refreshPromise.then((newToken) => {
    originalRequest.headers.Authorization = `Bearer ${newToken}`
    return axios(originalRequest)
  })
}

userClient.interceptors.response.use(undefined, handle401)
expenseClient.interceptors.response.use(undefined, handle401)

// ── Legacy default export (for backward compat) ──────────────
export const httpClient = authClient