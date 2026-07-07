// ── Auth domain types ────────────────────────────────────────
// Aligned with the Spring Boot AuthService / UserService DTOs.
// Snake-case JSON property names are mapped here so the rest
// of the frontend can use camelCase everywhere.
// ──────────────────────────────────────────────────────────────

/** Mirrors the fields available across AuthService + UserService. */
export type AuthUser = {
  userId: string
  username: string
  firstName: string
  lastName: string
  email: string
  phoneNumber?: number
}

/**
 * Represents the client-side session.
 * `accessToken`  – short-lived JWT (backend TTL: 60 s)
 * `refreshToken` – long-lived UUID (backend TTL: 10 min)
 */
export type AuthSession = {
  user: AuthUser
  accessToken: string
  refreshToken: string
}

/** POST /auth/v1/login  body: { username, password } */
export type LoginCredentials = {
  username: string
  password: string
}

/**
 * POST /auth/v1/signup  body (snake_case over the wire):
 * { username, password, first_name, last_name, phone_number, email }
 */
export type SignupCredentials = {
  username: string
  password: string
  firstName: string
  lastName: string
  phoneNumber: number
  email: string
}

/** Backend JWT + refresh-token response shape. */
export type JwtResponse = {
  accessToken: string
  token: string // this is the refresh token
}