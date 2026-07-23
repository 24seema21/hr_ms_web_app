/** A signed-in person. Deliberately contains no password and no token. */
export interface User {
  id: string
  name: string
  email: string
  role: UserRole
}

/*
  `as const` + a derived union instead of `enum UserRole { ... }`.
  `erasableSyntaxOnly: true` in tsconfig.app.json bans enums, because an enum
  emits real runtime JavaScript and therefore cannot simply be erased.

  This pattern is arguably better anyway: USER_ROLES is a plain array you can
  `.map()` over to build a dropdown, and UserRole stays a compile-time union.
*/
export const USER_ROLES = ['admin', 'hr', 'manager', 'employee'] as const
export type UserRole = (typeof USER_ROLES)[number]

export interface LoginCredentials {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResult {
  user: User
  /**
   * Stand-in for the real access token.
   *
   * PHASE 2 / SECURITY: a real token must never be handed to JavaScript at
   * all. The backend should set it as an httpOnly, Secure, SameSite cookie —
   * see the note in ../context/AuthContext.tsx.
   */
  token: string
}

/**
 * The failure shape every caller can rely on.
 *
 * A dedicated class (rather than throwing a bare string) means the UI can ask
 * `error instanceof AuthError` and know the message is safe to show a user —
 * as opposed to a stack trace or a network failure, which is not.
 */
export class AuthError extends Error {
  readonly code: AuthErrorCode

  constructor(code: AuthErrorCode, message: string) {
    super(message)
    // Without this, `error.name` reads "Error" in logs and dev tools.
    this.name = 'AuthError'
    // Note: assigned in the body rather than declared as a constructor
    // parameter property (`constructor(readonly code: ...)`) — parameter
    // properties are the other thing `erasableSyntaxOnly` bans.
    this.code = code
  }
}

export const AUTH_ERROR_CODES = ['invalid_credentials', 'network'] as const
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]
