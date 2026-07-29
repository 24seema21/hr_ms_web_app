import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AuthProvider } from '../context/AuthProvider'
import { AuthError } from '../types'
import { LoginForm } from './LoginForm'

/*
  We replace the API module, not the network.

  The component talks to `authApi.login()`, so that is the seam to control:
  the test decides whether the call succeeds or fails, and gets to assert
  exactly what was sent. It also means the real 800ms delay is skipped, so
  these tests run instantly.
*/
vi.mock('@/features/auth/api/authApi', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/features/auth/api/authApi')>()
  return { ...actual, login: vi.fn(), logout: vi.fn() }
})

// Imported *after* the mock declaration for readability; `vi.mock` is hoisted
// above the imports by Vitest, so the order here does not matter at runtime.
import * as authApi from '@/features/auth/api/authApi'

const DEMO_USER = {
  id: 'usr_001',
  name: 'Asha Rao',
  email: 'hr@demo.com',
  role: 'hr',
} as const

/**
 * LoginForm needs two things from its surroundings: auth state, and a router
 * (it calls `useNavigate`). MemoryRouter keeps history in memory rather than
 * touching the URL bar, which is what makes routing testable in Node.
 */
function renderLoginForm() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('LoginForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // AuthProvider restores a session from storage on mount — without this,
    // one test's login would leak into the next.
    window.sessionStorage.clear()
    window.localStorage.clear()
  })

  it('shows a validation error for each empty field on submit', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    await user.click(screen.getByRole('button', { name: /sign in/i }))

    expect(await screen.findByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    // Nothing was submitted, so the API must not have been called at all.
    expect(authApi.login).not.toHaveBeenCalled()
  })

  it('keeps the submit button enabled when validation fails', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    const submit = screen.getByRole('button', { name: /sign in/i })
    await user.click(submit)

    await screen.findByText('Email is required')
    // A disabled button after a failed submit is a dead end: the user fixes
    // the field and has no way to try again.
    expect(submit).toBeEnabled()
  })

  it('shows an email format error once the field loses focus', async () => {
    const user = userEvent.setup()
    renderLoginForm()

    /*
      Queried by its *label*, exactly as a user finds it. If the htmlFor/id
      wiring in TextField ever breaks, this line fails — so the test doubles
      as an accessibility check. A `container.querySelector('.email-input')`
      would pass happily with the label detached.
    */
    await user.type(screen.getByLabelText(/work email/i), 'not-an-email')
    await user.tab() // blur — validation mode is 'onBlur'

    expect(
      await screen.findByText('Enter a valid email address'),
    ).toBeInTheDocument()
  })

  it('calls the auth API with the entered credentials on a valid submit', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      user: DEMO_USER,
      token: 'demo-token',
    })
    renderLoginForm()

    await user.type(screen.getByLabelText(/work email/i), 'hr@demo.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.click(screen.getByRole('checkbox', { name: /remember me/i }))
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({
        email: 'hr@demo.com',
        password: 'Password123',
        rememberMe: true,
      })
    })
  })

  it('shows a form-level error when the login is rejected', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(
      new AuthError(
        'invalid_credentials',
        'That email and password combination is not recognised.',
      ),
    )
    renderLoginForm()

    await user.type(screen.getByLabelText(/work email/i), 'hr@demo.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    /*
      `getByRole('alert')` rather than matching the text: it asserts the
      message is announced to screen readers, which is the part that is easy
      to break and impossible to notice by eye.
    */
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /not recognised/i,
    )
  })

  it('reports an unreachable backend as such, not as a wrong password', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(
      new AuthError('network', 'Could not reach the server. Check your connection and try again.'),
    )
    renderLoginForm()

    await user.type(screen.getByLabelText(/work email/i), 'asha.rao@harkhr.com')
    await user.type(screen.getByLabelText(/password/i), 'Password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    /*
      The form shows the error's own message rather than a hard-coded one, so
      "the API is down" cannot be reported as "your password is wrong" — which
      would send the user off resetting a password that was never the problem.
    */
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not reach the server/i,
    )
  })

  it('does not clear the password after a failed attempt', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockRejectedValue(
      new AuthError(
        'invalid_credentials',
        'That email and password combination is not recognised.',
      ),
    )
    renderLoginForm()

    await user.type(screen.getByLabelText(/work email/i), 'hr@demo.com')
    await user.type(screen.getByLabelText(/password/i), 'WrongPassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))

    await screen.findByRole('alert')
    // Retyping a password because of one typo is a hostile touch — this test
    // is what stops a future refactor from reintroducing it.
    expect(screen.getByLabelText(/password/i)).toHaveValue('WrongPassword')
  })
})
