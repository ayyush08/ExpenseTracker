import type {
  AuthSession,
  ChangePasswordInput,
  LoginCredentials,
  SignupCredentials,
  UpdateProfileInput,
} from '../../types/auth'
import {
  changePassword as mockChangePassword,
  onSessionStorageChange,
  loadSession as mockLoadSession,
  signIn as mockSignIn,
  signOut as mockSignOut,
  signUp as mockSignUp,
  updateProfile as mockUpdateProfile,
} from './mock-auth-service'

export const authApi = {
  loadSession: (): AuthSession | null => mockLoadSession(),
  login: (credentials: LoginCredentials): Promise<AuthSession> =>
    Promise.resolve(mockSignIn(credentials)),
  signup: (credentials: SignupCredentials): Promise<AuthSession> =>
    Promise.resolve(mockSignUp(credentials)),
  logout: (): Promise<void> => {
    mockSignOut()
    return Promise.resolve()
  },
  updateProfile: (input: UpdateProfileInput): Promise<AuthSession> =>
    Promise.resolve(mockUpdateProfile(input)),
  changePassword: (input: ChangePasswordInput): Promise<void> => {
    mockChangePassword(input)
    return Promise.resolve()
  },
  subscribeToSessionChanges: (listener: () => void) => onSessionStorageChange(listener),
}