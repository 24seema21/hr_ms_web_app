import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpNetworkError, httpResponseError } from '@/test/httpErrors'
import { AuthError } from '../types'

/*
  We mock the transport, not the API layer.

  These tests are about the one thing `authApi` actually does: turn HTTP into
  domain objects. So the seam to replace is `httpClient` — the real `login()`
  runs, with a fake socket underneath it. Mocking `authApi` itself would test
  nothing at all.

  `importOriginal` keeps the module's other exports (`httpStatusOf`,
  `isNetworkError`, `readApiMessage`) real, because `authApi` imports those too
  and they are part of the logic under test.
*/
vi.mock('@/shared/lib/httpClient', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/httpClient')>()
  return { ...actual, httpClient: { post: vi.fn() } }
})

import { httpClient } from '@/shared/lib/httpClient'
import { login, logout } from './authApi'

const post = vi.mocked(httpClient.post)

/** The exact success body the Go handler returns. */
const LOGIN_SUCCESS = { data: { message: 'Login Successful' } }

const CREDENTIALS = {
  email: 'asha.rao@harkhr.com',
  password: 'Password123',
  rememberMe: true,
}

/**
 * Calls `login()` expecting it to reject, and hands back the AuthError.
 *
 * The plain `.catch(e => e)` version types the result as
 * `AuthResult | AuthError`, so every assertion needs a cast. This narrows once,
 * and fails loudly if the call unexpectedly succeeds — a `.catch` would let
 * that pass silently.
 */
async function loginFailure(): Promise<AuthError> {
  try {
    await login(CREDENTIALS)
  } catch (caught) {
    if (caught instanceof AuthError) return caught
    throw caught
  }
  throw new Error('Expected login() to reject, but it resolved.')
}

describe('authApi.login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('posts the credentials to /login', async () => {
    post.mockResolvedValue(LOGIN_SUCCESS)

    await login(CREDENTIALS)

    expect(post).toHaveBeenCalledWith('/login', {
      email: 'asha.rao@harkhr.com',
      password: 'Password123',
    })
  })

  it('does not send rememberMe to the server', async () => {
    post.mockResolvedValue(LOGIN_SUCCESS)

    await login(CREDENTIALS)

    // Which storage holds the session is a browser decision. Sending it would
    // imply the server has a say, and invite someone to make it have one.
    expect(post.mock.calls[0][1]).not.toHaveProperty('rememberMe')
  })

  it('trims and lower-cases the email before sending it', async () => {
    post.mockResolvedValue(LOGIN_SUCCESS)

    await login({ ...CREDENTIALS, email: '  Asha.Rao@HarkHR.com  ' })

    // Trimmed on the wire — a pasted address with a trailing space must not
    // become a "user not found".
    expect(post.mock.calls[0][1]).toMatchObject({
      email: 'Asha.Rao@HarkHR.com',
    })
  })

  it('returns a user built from the verified email', async () => {
    post.mockResolvedValue(LOGIN_SUCCESS)

    const result = await login(CREDENTIALS)

    /*
      Pins the documented stopgap: the backend returns no profile, so the user
      is derived from the email. When `POST /login` starts returning real
      fields, this test is what tells you to stop guessing.
    */
    expect(result.user).toEqual({
      id: 'asha.rao@harkhr.com',
      name: 'Asha Rao',
      email: 'asha.rao@harkhr.com',
      role: 'employee',
    })
  })

  it('defaults the role to employee, never higher', async () => {
    post.mockResolvedValue(LOGIN_SUCCESS)

    const result = await login(CREDENTIALS)

    // The frontend must not grant a permission level the backend never
    // confirmed. Least privilege is the only safe default.
    expect(result.user.role).toBe('employee')
  })

  it('maps a 401 to an invalid_credentials AuthError', async () => {
    post.mockRejectedValue(
      httpResponseError(401, { message: 'Wrong Password' }),
    )

    await expect(login(CREDENTIALS)).rejects.toBeInstanceOf(AuthError)
    await expect(login(CREDENTIALS)).rejects.toMatchObject({
      code: 'invalid_credentials',
    })
  })

  it('gives the same message whether the email or the password was wrong', async () => {
    post.mockRejectedValueOnce(
      httpResponseError(401, { message: 'Invalid Email' }),
    )
    const unknownEmail = await loginFailure()

    post.mockRejectedValueOnce(
      httpResponseError(401, { message: 'Wrong Password' }),
    )
    const wrongPassword = await loginFailure()

    /*
      The account-enumeration guard, and the reason this test exists: the server
      tells us which of the two failed, and we must not pass that on. Anyone
      can otherwise use the login form to discover who has an account.
    */
    expect(unknownEmail.message).toBe(wrongPassword.message)
    // And neither carries the server's own wording, which names the field.
    expect(unknownEmail.message).not.toMatch(/invalid email|wrong password/i)
  })

  it('maps a no-response failure to a network AuthError', async () => {
    post.mockRejectedValue(httpNetworkError())

    const error = await loginFailure()

    // Reporting "the backend is down" as "wrong password" is the most
    // confusing thing a login form can do.
    expect(error.code).toBe('network')
    expect(error.message).toMatch(/could not reach the server/i)
  })

  it('maps a 500 to a server AuthError', async () => {
    post.mockRejectedValue(httpResponseError(500, { message: 'boom' }))

    const error = await loginFailure()

    expect(error.code).toBe('server')
    // The server's own wording is for the console, not the user.
    expect(error.message).not.toMatch(/boom/)
  })

  it('keeps the underlying failure on `cause` for debugging', async () => {
    post.mockRejectedValue(
      httpResponseError(401, { message: 'Wrong Password' }),
    )

    const error = await loginFailure()

    // Hidden from the user, one click away in dev tools.
    expect(error.cause).toBeDefined()
  })
})

describe('authApi.logout', () => {
  it('resolves without calling the backend', async () => {
    vi.clearAllMocks()

    await expect(logout()).resolves.toBeUndefined()

    // There is no /logout route on the server; requesting one would 404 on
    // every sign-out. Delete this test when the backend grows sessions.
    expect(post).not.toHaveBeenCalled()
  })
})
