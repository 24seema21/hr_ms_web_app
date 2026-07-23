import type { User } from '../types'

const STORAGE_KEY = 'harkhr.auth.user'

/*
  ─────────────────────────────────────────────────────────────────────────────
  SECURITY NOTE — READ BEFORE PHASE 2
  ─────────────────────────────────────────────────────────────────────────────
  We persist the *user profile* here so a page refresh does not log you out.
  That is fine: a name and an email are already on screen.

  An auth **token** must never be stored this way. Anything in localStorage or
  sessionStorage is readable by any JavaScript running on the page — so a
  single XSS bug (a dependency, an ad script, a bad `dangerouslySetInnerHTML`)
  hands an attacker a working session.

  The correct design, to implement in Phase 2: the backend returns the token in
  a `Set-Cookie` header marked `httpOnly; Secure; SameSite=Lax`. JavaScript
  literally cannot read it, and the browser attaches it to requests
  automatically. This module then keeps only the display profile, exactly as
  it does now.
*/

/**
 * Where the session lives.
 *
 * This is what makes "Remember me" mean something:
 * - `localStorage`   — survives closing the browser (checked).
 * - `sessionStorage` — cleared when the tab closes (unchecked), which is the
 *   right default on a shared or public machine.
 */
function pickStorage(rememberMe: boolean): Storage {
  return rememberMe ? window.localStorage : window.sessionStorage
}

export function readStoredUser(): User | null {
  /*
    Every access is wrapped in try/catch. Storage throws — Safari private mode,
    a full quota, or a browser configured to block it. An unhandled throw here
    would blank the entire app on boot, which is a far worse outcome than
    simply asking the user to sign in again.
  */
  try {
    const raw =
      window.sessionStorage.getItem(STORAGE_KEY) ??
      window.localStorage.getItem(STORAGE_KEY)

    if (!raw) return null

    // Storage is plain text a user can edit, so treat it as untrusted input.
    const parsed: unknown = JSON.parse(raw)
    if (!isUser(parsed)) {
      clearStoredUser()
      return null
    }
    return parsed
  } catch {
    return null
  }
}

export function persistUser(user: User, rememberMe: boolean): void {
  try {
    // Clear both first, so toggling "Remember me" cannot leave a stale copy
    // behind in the storage we are no longer writing to.
    clearStoredUser()
    pickStorage(rememberMe).setItem(STORAGE_KEY, JSON.stringify(user))
  } catch {
    // Non-fatal: the user stays logged in for this page view, and simply has
    // to sign in again after a refresh.
  }
}

export function clearStoredUser(): void {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY)
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Nothing useful to do — the in-memory state is cleared regardless.
  }
}

/**
 * A hand-written type guard.
 *
 * `JSON.parse` returns `any`, so without a check like this TypeScript would
 * happily believe a hand-edited storage entry is a valid `User` — and the app
 * would crash later, far from the actual cause.
 */
function isUser(value: unknown): value is User {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  return (
    typeof candidate.id === 'string' &&
    typeof candidate.name === 'string' &&
    typeof candidate.email === 'string' &&
    typeof candidate.role === 'string'
  )
}
