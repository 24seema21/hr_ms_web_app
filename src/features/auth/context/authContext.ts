import { createContext } from 'react'
import type { LoginCredentials, User } from '../types'

export const AUTH_STATUSES = [
  'unauthenticated',
  'authenticating',
  'authenticated',
] as const
export type AuthStatus = (typeof AUTH_STATUSES)[number]

/** The complete contract every consumer of the auth context can rely on. */
export interface AuthContextValue {
  user: User | null
  status: AuthStatus
  /** Last failure message, safe to display. `null` when there is none. */
  error: string | null
  /** Resolves with the signed-in user, or rejects with an `AuthError`. */
  login: (credentials: LoginCredentials) => Promise<User>
  logout: () => Promise<void>
}

/*
  The context object lives in its own module, separate from the provider
  component, for two reasons:

  1. Vite's fast refresh only preserves state in files that export components
     and nothing else. A file exporting both `AuthContext` and `AuthProvider`
     silently loses hot-reload — a confusing "why does my form keep resetting?"
     that is hard to trace back to the file layout.
  2. The `useAuth` hook can import the context without pulling in the whole
     provider (and its dependencies) behind it.

  The default is `null`, not a stub object, so that `useAuth` can detect
  "used outside the provider" and say so loudly. See ../hooks/useAuth.ts.
*/
export const AuthContext = createContext<AuthContextValue | null>(null)
