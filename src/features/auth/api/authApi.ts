import {
  httpClient,
  httpStatusOf,
  isNetworkError,
  readApiMessage,
} from '@/shared/lib/httpClient'
import { AuthError } from '../types'
import type { AuthResult, LoginCredentials, User } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE BACKEND SWAP SEAM — now wired to the real API
  ─────────────────────────────────────────────────────────────────────────────
  This is the file the whole auth feature was designed around: everything that
  knows the backend exists lives here, and nothing else changed when the mock
  was replaced. `AuthProvider`, `LoginForm`, `ProtectedRoute` and the dashboard
  were written against the *contract* — `login()` returns a Promise<AuthResult>
  and rejects with an AuthError — so they did not need touching.

  That is dependency inversion doing its job, and it is why "we'll wire up the
  API later" did not turn into a rewrite.

  The live contract, from the Go handler (HRMS_API/hr_ms_api/login/handlers.go):

    POST /login   { "email": string, "password": string }

    200  { "message": "Login Successful" }
    401  { "message": "Invalid Email" }      email not in the users table
    401  { "message": "Wrong Password" }     bcrypt comparison failed
    400  { "message": "Invalid Request" }    body was not valid JSON
*/

const LOGIN_ENDPOINT = '/login'

/** What the server sends back. Today it is only ever a human-readable string. */
interface LoginResponseBody {
  message?: string
}

export async function login(
  credentials: LoginCredentials,
): Promise<AuthResult> {
  // Zod already trimmed this, but `login()` is a public function — it must not
  // depend on every future caller having validated first.
  const email = credentials.email.trim()

  try {
    /*
      Only the two fields the API declares. `rememberMe` is deliberately not
      sent: it decides which browser storage holds the session, which is purely
      a client concern the server has no opinion about.

      axios rejects the promise on any non-2xx status, so reaching the line
      after this `try` block means the login genuinely succeeded — there is no
      `if (response.ok)` check to forget, which is the standard `fetch` trap.
    */
    await httpClient.post<LoginResponseBody>(LOGIN_ENDPOINT, {
      email,
      password: credentials.password,
    })
  } catch (caught) {
    throw toAuthError(caught)
  }

  return { user: toUser(email) }
}

export async function logout(): Promise<void> {
  /*
    Deliberately a no-op: the backend exposes exactly one route, `POST /login`.

    Calling a `/logout` that does not exist would 404 on every sign-out, and a
    console that always has a red line in it is a console nobody reads. Clearing
    the client session (AuthProvider does that already) is the whole logout for
    now.

    When the backend gains sessions, this becomes `await httpClient.post(
    '/logout')` so the server can revoke the token — clearing client state alone
    leaves a valid session alive on the server.
  */
}

/*
  ─────────────────────────────────────────────────────────────────────────────
  Translating transport failures into domain failures
  ─────────────────────────────────────────────────────────────────────────────
  Everything above this line deals in HTTP; everything above *the API layer*
  deals in AuthError. This function is the border crossing, and it exists so
  that no component ever has to know what a status code is.
*/
function toAuthError(caught: unknown): AuthError {
  if (isNetworkError(caught)) {
    /*
      No response at all. In development the overwhelmingly likely causes are
      the Go server not running, MySQL being down (it is dialled at startup),
      or the dev server serving from a port outside the backend's CORS
      allowlist — see the note in vite.config.ts.
    */
    return new AuthError(
      'network',
      'Could not reach the server. Check your connection and try again.',
      { cause: caught },
    )
  }

  if (httpStatusOf(caught) === 401) {
    /*
      One message for both 401s, on purpose.

      The server distinguishes "Invalid Email" from "Wrong Password", and we
      throw that distinction away rather than pass it on. Telling a stranger
      which emails are registered is account enumeration — a real vulnerability
      and the first step of a credential-stuffing run. The server message is
      still reachable through `cause` while debugging.
    */
    return new AuthError(
      'invalid_credentials',
      'That email and password combination is not recognised.',
      { cause: caught },
    )
  }

  /*
    Anything else — a 400, a 500, a proxy's HTML error page — is our bug or the
    server's, never something the user can fix by retyping. `readApiMessage`
    puts the backend's own wording in the console via `cause` without showing
    developer-facing text to the user.
  */
  return new AuthError(
    'server',
    'Something went wrong on our side. Please try again in a moment.',
    { cause: readApiMessage(caught) ?? caught },
  )
}

/*
  ─────────────────────────────────────────────────────────────────────────────
  KNOWN GAP — the backend does not return a profile
  ─────────────────────────────────────────────────────────────────────────────
  A successful login yields `{"message":"Login Successful"}`: no id, no name,
  no role. The UI needs a `User` (the dashboard greets people by name and the
  route guard will branch on role), so we synthesise the best one available
  from the only fact we hold — the email that was just proven to work.

  This is a stopgap, and the shape of the fix is already decided: the handler
  should select the profile columns it is discarding today and return them, or
  a `GET /me` should exist to fetch them. Until then:

    - `role` is `'employee'`, the least-privileged option. Defaulting to
      anything higher would mean the frontend granting permissions the backend
      never confirmed, which is exactly backwards.
    - `id` is the email, since it is the only identifier we actually have.
*/
function toUser(email: string): User {
  const normalisedEmail = email.toLowerCase()
  return {
    id: normalisedEmail,
    name: nameFromEmail(normalisedEmail),
    email: normalisedEmail,
    role: 'employee',
  }
}

/** `asha.rao@harkhr.com` → `Asha Rao`. A placeholder, not a real display name. */
function nameFromEmail(email: string): string {
  const [localPart = ''] = email.split('@')
  const words = localPart.split(/[._-]+/).filter(Boolean)
  if (words.length === 0) return email
  return words
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
