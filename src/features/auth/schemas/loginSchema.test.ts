import { describe, expect, it } from 'vitest'
import { loginSchema } from './loginSchema'

/*
  Pure unit tests: no React, no DOM, no rendering. They run in a few
  milliseconds, so validation rules can be covered exhaustively here and the
  slower component tests are free to focus on behaviour instead.
*/

/** Builds a valid payload, with only the fields under test overridden. */
function validValues(overrides: Record<string, unknown> = {}) {
  return {
    email: 'hr@demo.com',
    password: 'Password123',
    rememberMe: false,
    ...overrides,
  }
}

/** The message Zod reported for a given field, or undefined if it passed. */
function errorFor(values: unknown, field: string): string | undefined {
  const result = loginSchema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('loginSchema', () => {
  it('accepts a valid email and password', () => {
    expect(loginSchema.safeParse(validValues()).success).toBe(true)
  })

  describe('email', () => {
    it('rejects an empty value as required', () => {
      expect(errorFor(validValues({ email: '' }), 'email')).toBe(
        'Email is required',
      )
    })

    it('reports whitespace-only input as required, not as malformed', () => {
      // Proves `.trim()` runs before the length check.
      expect(errorFor(validValues({ email: '   ' }), 'email')).toBe(
        'Email is required',
      )
    })

    it('rejects a malformed address', () => {
      expect(errorFor(validValues({ email: 'not-an-email' }), 'email')).toBe(
        'Enter a valid email address',
      )
    })

    it('trims surrounding whitespace from the parsed value', () => {
      const result = loginSchema.parse(validValues({ email: ' hr@demo.com ' }))
      // The *output* is cleaned, so the API never receives padded input.
      expect(result.email).toBe('hr@demo.com')
    })
  })

  describe('password', () => {
    it('rejects an empty value as required', () => {
      expect(errorFor(validValues({ password: '' }), 'password')).toBe(
        'Password is required',
      )
    })

    it('rejects fewer than 8 characters', () => {
      expect(errorFor(validValues({ password: 'Pass1' }), 'password')).toBe(
        'Password must be at least 8 characters',
      )
    })

    it('accepts exactly 8 characters', () => {
      // Boundary check: off-by-one in a `min` is the classic mistake here.
      expect(loginSchema.safeParse(validValues({ password: 'Pass1234' })).success).toBe(
        true,
      )
    })

    it('does not trim the password', () => {
      // Spaces can be a deliberate part of a passphrase — stripping them would
      // silently lock people out.
      const result = loginSchema.parse(validValues({ password: ' Password1 ' }))
      expect(result.password).toBe(' Password1 ')
    })
  })

  describe('rememberMe', () => {
    it('rejects a non-boolean', () => {
      expect(loginSchema.safeParse(validValues({ rememberMe: 'yes' })).success).toBe(
        false,
      )
    })
  })
})
