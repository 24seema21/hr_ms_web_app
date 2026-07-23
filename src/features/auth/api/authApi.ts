import { AuthError } from '../types'
import type { AuthResult, LoginCredentials, User } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE BACKEND SWAP SEAM
  ─────────────────────────────────────────────────────────────────────────────
  Everything fake in this app is inside this one file.

  No component, hook or context below knows whether the data is mocked or real
  — they only know that `login()` returns a Promise<AuthResult> and rejects
  with an AuthError. Connecting the real API in Phase 2 means rewriting the
  bodies of these two functions (a `fetch` to VITE_API_BASE_URL) and changing
  nothing else in the codebase.

  That is dependency inversion: the UI depends on the *contract*, not on the
  implementation. It is the single most valuable idea in this whole structure,
  because it is what stops "we'll wire up the API later" from turning into a
  rewrite.
*/

/** The only account that exists until a real backend does. */
const DEMO_USER: User = {
  id: 'usr_001',
  name: 'Asha Rao',
  email: 'hr@demo.com',
  role: 'hr',
}

export const DEMO_CREDENTIALS = {
  email: 'hr@demo.com',
  password: 'Password123',
} as const

/**
 * Fakes network latency.
 *
 * This is not padding — it is the point. With an instant response you never
 * see your own loading state, so you ship a spinner that was never rendered
 * once and a form that can be double-submitted.
 */
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResult> {
  await delay(800)

  const emailMatches =
    // Emails are case-insensitive in practice; passwords never are.
    credentials.email.trim().toLowerCase() === DEMO_CREDENTIALS.email
  const passwordMatches = credentials.password === DEMO_CREDENTIALS.password

  if (!emailMatches || !passwordMatches) {
    /*
      One message for both failures, on purpose. Saying "no such account"
      versus "wrong password" tells an attacker which emails are registered —
      that is account enumeration, and it is a real vulnerability, not a
      usability nicety.
    */
    throw new AuthError(
      'invalid_credentials',
      'That email and password combination is not recognised.',
    )
  }

  return { user: DEMO_USER, token: 'demo-token' }
}

export async function logout(): Promise<void> {
  // Real implementation: POST /auth/logout so the server can revoke the
  // session. Clearing client state alone leaves a valid token on the server.
  await delay(200)
}
