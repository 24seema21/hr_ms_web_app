import { beforeEach, expect, test, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { httpResponseError } from '@/test/httpErrors'

/*
  The network is the only thing faked here.

  Everything else is real — the router, the auth provider, the form, and the
  API layer's own status-code mapping. Stubbing `authApi` instead would leave
  the most breakable part of sign-in (translating a 401 into the right message)
  untested by any flow test. Stubbing nothing would make this suite depend on
  a Go server and a MySQL database being up, which is not a unit test.

  The factory must not reference anything declared below it: `vi.mock` is
  hoisted above the imports, so the constants in this file do not exist yet
  when it runs. The fake responses are installed per-test instead.
*/
vi.mock('@/shared/lib/httpClient', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/httpClient')>()
  return { ...actual, httpClient: { post: vi.fn() } }
})

import { httpClient } from '@/shared/lib/httpClient'
import { App } from './App'
import { router } from './routes'
import { readStoredUser } from '@/features/auth/lib/authStorage'

const LONG = { timeout: 5000 }

/** The one account our fake `POST /login` accepts. */
const ACCOUNT = { email: 'asha.rao@harkhr.com', password: 'Password123' }

/**
 * Stands in for the Go handler, replying exactly as it does:
 * 200 `{"message":"Login Successful"}` or 401 `{"message":"Wrong Password"}`.
 */
function installFakeBackend() {
  vi.mocked(httpClient.post).mockImplementation(async (_url, body) => {
    const { email, password } = body as { email: string; password: string }
    if (email !== ACCOUNT.email || password !== ACCOUNT.password) {
      throw httpResponseError(401, { message: 'Wrong Password' })
    }
    return { data: { message: 'Login Successful' } }
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  installFakeBackend()
})

test('full landing → login → dashboard → logout flow', async () => {
  const user = userEvent.setup()
  window.sessionStorage.clear()
  window.localStorage.clear()
  await router.navigate('/')

  render(<App />)

  // 1. Landing page renders.
  expect(
    await screen.findByRole('heading', {
      name: /first day to last, in one register/i,
      level: 1,
    }),
  ).toBeInTheDocument()
  console.log('✓ 1  landing page renders')

  // 2. "Sign in" navigates to /login via the router (no reload).
  const headerSignIn = screen.getAllByRole('link', { name: /^sign in$/i })[0]
  await user.click(headerSignIn)
  expect(
    await screen.findByRole('heading', { name: /sign in to unity portal/i, level: 1 }),
  ).toBeInTheDocument()
  expect(window.location.pathname).toBe('/login')
  console.log('✓ 2  sign-in navigates to /login client-side')

  // 3. Empty submit → inline errors, button stays enabled.
  const submit = screen.getByRole('button', { name: /^sign in$/i })
  await user.click(submit)
  expect(await screen.findByText('Email is required')).toBeInTheDocument()
  expect(screen.getByText('Password is required')).toBeInTheDocument()
  expect(submit).toBeEnabled()
  console.log('✓ 3  empty submit shows both errors, button stays enabled')

  // 4. Bad email format errors on blur.
  const email = screen.getByLabelText(/work email/i)
  await user.type(email, 'not-an-email')
  await user.tab()
  expect(
    await screen.findByText('Enter a valid email address'),
  ).toBeInTheDocument()
  console.log('✓ 4  invalid email errors on blur')

  // 5. Wrong password → 401 from the API → form-level error, password NOT cleared.
  await user.clear(email)
  await user.type(email, ACCOUNT.email)
  const password = screen.getByLabelText(/password/i)
  await user.type(password, 'WrongPassword')
  await user.click(submit)
  expect(await screen.findByRole('alert', undefined, LONG)).toHaveTextContent(
    /not recognised/i,
  )
  expect(password).toHaveValue('WrongPassword')
  console.log('✓ 5  wrong password → form-level error, password preserved')

  // 6. Correct credentials → dashboard showing the user's name.
  await user.clear(password)
  await user.type(password, ACCOUNT.password)
  await user.click(submit)
  expect(
    await screen.findByRole('heading', { name: /welcome back, asha rao/i }, LONG),
  ).toBeInTheDocument()
  expect(window.location.pathname).toBe('/dashboard')
  console.log('✓ 6  valid login redirects to /dashboard with the user name')

  // 7. Session persisted, so a refresh keeps you logged in.
  expect(readStoredUser()).toMatchObject({ email: ACCOUNT.email })
  // rememberMe was left unchecked → sessionStorage, not localStorage.
  expect(window.sessionStorage.getItem('harkhr.auth.user')).not.toBeNull()
  expect(window.localStorage.getItem('harkhr.auth.user')).toBeNull()
  console.log('✓ 7  session persisted to sessionStorage (rememberMe unchecked)')

  // 8a. Log out → back to the landing page, storage cleared.
  await user.click(screen.getByRole('button', { name: /log out/i }))
  expect(
    await screen.findByRole(
      'heading',
      { name: /first day to last, in one register/i, level: 1 },
      LONG,
    ),
  ).toBeInTheDocument()
  expect(readStoredUser()).toBeNull()
  console.log('✓ 8a logout returns to landing page and clears the session')

  // 8b. Visiting /dashboard while logged out → redirected to /login.
  await router.navigate('/dashboard')
  await waitFor(
    () => expect(window.location.pathname).toBe('/login'),
    { timeout: 5000 },
  )
  expect(
    await screen.findByRole('heading', { name: /sign in to unity portal/i, level: 1 }),
  ).toBeInTheDocument()
  console.log('✓ 8b /dashboard while logged out redirects to /login')
}, 30000)

test('remember me stores the session in localStorage instead', async () => {
  const user = userEvent.setup()
  window.sessionStorage.clear()
  window.localStorage.clear()
  await router.navigate('/login')

  render(<App />)

  await user.type(await screen.findByLabelText(/work email/i), ACCOUNT.email)
  await user.type(screen.getByLabelText(/password/i), ACCOUNT.password)
  await user.click(screen.getByRole('checkbox', { name: /remember me/i }))
  await user.click(screen.getByRole('button', { name: /^sign in$/i }))

  // Must be the dashboard greeting, not the login page's "Welcome back" <h2>.
  await screen.findByRole('heading', { name: /welcome back, asha rao/i }, LONG)
  expect(window.localStorage.getItem('harkhr.auth.user')).not.toBeNull()
  expect(window.sessionStorage.getItem('harkhr.auth.user')).toBeNull()
  console.log('✓ 9  remember me persists to localStorage')
}, 30000)
