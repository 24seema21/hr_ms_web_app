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
   * Optional, because the current backend does not issue one.
   *
   * `POST /login` answers a valid sign-in with `{"message":"Login Successful"}`
   * and nothing else — no token, no profile. Marking this optional keeps the
   * type honest instead of inventing a token the server never sent.
   *
   * SECURITY, for when the backend does issue one: a real access token should
   * never be handed to JavaScript at all. The correct design is a `Set-Cookie`
   * header marked `httpOnly; Secure; SameSite=Lax` — see the note in
   * ../lib/authStorage.ts.
   */
  token?: string
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

  /**
   * `options` carries the standard `cause`, which is where the underlying
   * axios error goes. The user sees `message`; a developer opening the console
   * can follow `cause` down to the actual status code and response body.
   */
  constructor(code: AuthErrorCode, message: string, options?: ErrorOptions) {
    super(message, options)
    // Without this, `error.name` reads "Error" in logs and dev tools.
    this.name = 'AuthError'
    // Note: assigned in the body rather than declared as a constructor
    // parameter property (`constructor(readonly code: ...)`) — parameter
    // properties are the other thing `erasableSyntaxOnly` bans.
    this.code = code
  }
}

/*
  Three distinct failures, because they need three different responses from the
  UI and from the person reading the message:

  - `invalid_credentials` — the server checked and said no. Retyping may help.
  - `network`             — no reply at all: backend down, offline, CORS, or a
                            timeout. Retyping will not help.
  - `server`              — the server replied with a failure that is not about
                            the credentials (a 500, or a 400 we caused). That
                            is a bug, not user error.
*/
export const AUTH_ERROR_CODES = [
  'invalid_credentials',
  'network',
  'server',
] as const
export type AuthErrorCode = (typeof AUTH_ERROR_CODES)[number]
