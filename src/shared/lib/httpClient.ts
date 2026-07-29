import axios from 'axios'
import type { AxiosInstance } from 'axios'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE HTTP CLIENT
  ─────────────────────────────────────────────────────────────────────────────
  One configured axios instance for the whole app, created once when this
  module first loads.

  Why an instance instead of calling `axios.get(...)` directly everywhere:

  1. The base URL lives in exactly one place. Moving the backend to a staging
     host is an environment-variable change, not a find-and-replace.
  2. Cross-cutting concerns — timeouts, auth headers, a central 401 handler —
     have somewhere to go. Attaching them to the global `axios` object would
     also affect any third-party library that imports axios, which is a nasty
     way to break something you do not own.
  3. Tests can replace this one module and every feature's API layer is
     redirected with it.

  This file lives in `shared/` because it is domain-agnostic: attendance,
  payroll and leave will all import it in later phases. Remember the one
  structural rule — `shared/` must never import from `features/`.
*/

/**
 * Used when `VITE_API_BASE_URL` is not set, which is the normal case in local
 * development. Hard-coding the fallback keeps a fresh clone runnable; the env
 * variable is what makes staging and production possible.
 */
const DEFAULT_BASE_URL = 'http://localhost:8080'

export const httpClient: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? DEFAULT_BASE_URL,

  /*
    Without a timeout, axios waits forever. A backend that accepts the socket
    and then hangs — a stalled database query is the classic cause — leaves the
    submit button spinning with no error and no way out. Ten seconds is long
    enough for a slow query and short enough that the user gets an answer.
  */
  timeout: 10_000,

  headers: { 'Content-Type': 'application/json' },

  /*
    `withCredentials` stays off (the default).

    Turning it on tells the browser to send cookies cross-origin, which is what
    a session-cookie backend needs. Ours does not issue one yet, and the Go
    server's CORS config does not set `AllowCredentials`, so enabling it here
    would make every request fail the CORS check for no benefit. This is the
    line to flip when the backend starts setting an httpOnly session cookie.
  */
})

/** Every error body this backend returns has the same shape: `{"message": …}`. */
export interface ApiErrorBody {
  message?: string
}

/**
 * The HTTP status of a failed request, or `undefined` if there was no reply.
 *
 * The distinction matters: "the server said 401" and "the server never
 * answered" are different problems and deserve different messages.
 */
export function httpStatusOf(error: unknown): number | undefined {
  return axios.isAxiosError(error) ? error.response?.status : undefined
}

/**
 * True when the request never produced a response — the server is down, DNS
 * failed, the connection dropped, CORS blocked it, or our timeout fired.
 */
export function isNetworkError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response === undefined
}

/**
 * The backend's own `message` field, when there is one.
 *
 * Useful for logging and for attaching to an error's `cause`. Think twice
 * before rendering it: server text is written for developers, and — as
 * `Invalid Email` versus `Wrong Password` shows — it can leak more than the
 * user is meant to know.
 */
export function readApiMessage(error: unknown): string | undefined {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return undefined
  const message = error.response?.data?.message
  return typeof message === 'string' && message.length > 0 ? message : undefined
}
