import { useCallback, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import * as authApi from '../api/authApi'
import { AuthError } from '../types'
import type { LoginCredentials, User } from '../types'
import { clearStoredUser, persistUser, readStoredUser } from '../lib/authStorage'
import { AuthContext } from './authContext'
import type { AuthContextValue, AuthStatus } from './authContext'

interface AuthProviderProps {
  children: ReactNode
}

/*
  Why auth is a Context, when most state should NOT be:

  Context is for state that is genuinely global and read in unrelated corners
  of the tree — the header, the login page, every future protected route.
  Passing it by props would thread `user` through a dozen components that do
  not care about it, and every one of them would need editing the day the
  shape changes.

  The trap is reaching for Context by default. It has no built-in way to say
  "only re-render the components that use the piece I changed" — every
  consumer re-renders whenever the value does. So state belonging to one
  screen stays in that screen (`useState`), server data belongs in a data
  library, and Context is reserved for the handful of truly cross-cutting
  things: auth, theme, locale.
*/
export function AuthProvider({ children }: AuthProviderProps) {
  /*
    A *lazy* initialiser: passing the function itself (`useState(readStoredUser)`)
    rather than calling it (`useState(readStoredUser())`) means React runs it
    once, on mount, instead of on every single render.

    Reading storage synchronously here is deliberate — the user is already
    present on the very first render, so a returning visitor never sees the
    logged-out page flash before being restored.
  */
  const [user, setUser] = useState<User | null>(readStoredUser)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /*
    `status` is *derived*, not stored. Keeping a second `useState` for it would
    let it drift out of sync with `user` — the classic bug where you set the
    user but forget to set the status. If a value can be computed from state
    you already have, compute it.
  */
  const status: AuthStatus = isAuthenticating
    ? 'authenticating'
    : user !== null
      ? 'authenticated'
      : 'unauthenticated'

  /*
    `useCallback` keeps this the *same function object* across renders. Without
    it, `login` would be a brand-new function every render, which would change
    the context value every render, which would re-render every consumer —
    defeating the `useMemo` below.
  */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<User> => {
      setIsAuthenticating(true)
      setError(null)
      try {
        const result = await authApi.login(credentials)
        setUser(result.user)
        persistUser(result.user, credentials.rememberMe ?? false)
        return result.user
      } catch (caught) {
        /*
          Only an AuthError carries a message written for a human. Anything
          else is a bug or a network failure, and echoing its raw text at the
          user leaks internals and helps nobody.
        */
        const message =
          caught instanceof AuthError
            ? caught.message
            : 'Something went wrong. Please try again.'
        setError(message)
        // Re-thrown so the caller (LoginForm) can react — show the message
        // inline, keep focus in the form, leave the fields filled in.
        throw caught
      } finally {
        // `finally` runs on both the success and the failure path, so the
        // spinner can never get stuck on.
        setIsAuthenticating(false)
      }
    },
    [],
  )

  const logout = useCallback(async (): Promise<void> => {
    /*
      Clear the client session *first*, then tell the server.

      Logging out must never depend on a network round-trip succeeding. If the
      request is awaited first and it fails — offline, server down — the user
      clicks "Log out", sees an error, and is still signed in, with their
      session sitting in storage. Clearing locally up front means the logout
      always takes effect immediately; the server call is best-effort cleanup.
    */
    setUser(null)
    setError(null)
    clearStoredUser()

    // Revokes the session server-side so the token cannot be replayed.
    await authApi.logout()
  }, [])

  /*
    Without this `useMemo`, `{ user, status, ... }` would be a new object on
    every provider render. Context compares by reference, so every consumer in
    the app would re-render even when nothing about auth had changed.
  */
  const value = useMemo<AuthContextValue>(
    () => ({ user, status, error, login, logout }),
    [user, status, error, login, logout],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
