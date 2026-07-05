export type AuthUser = {
  id: string
  fullName: string
  email: string
  role: 'user' | 'admin'
  avatarUrl?: string
  currency: string
  monthlyBudget: number
  createdAt: string
}

export type AuthSession = {
  user: AuthUser
  token: string
  expiresAt: string
}

export type LoginCredentials = {
  email: string
  password: string
}

export type SignupCredentials = {
  fullName: string
  email: string
  password: string
}

export type UpdateProfileInput = {
  fullName: string
  email: string
  currency: string
  monthlyBudget: number
}

export type ChangePasswordInput = {
  currentPassword: string
  newPassword: string
}