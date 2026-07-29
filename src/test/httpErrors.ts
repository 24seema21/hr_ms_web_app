import { AxiosError, AxiosHeaders } from 'axios'
import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios'

/*
  Builders for the two failure shapes axios throws.

  Tests could hand-roll `{ isAxiosError: true, response: { status: 401 } }`, and
  it would work — until axios changes how it detects its own errors, at which
  point every one of those objects silently stops being recognised and the
  tests keep passing while the app breaks. Constructing a real `AxiosError`
  means the code under test sees exactly what it will see in production.
*/

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig

/** What axios throws when the server replies with a non-2xx status. */
export function httpResponseError(status: number, data: unknown): AxiosError {
  const response = {
    status,
    statusText: '',
    data,
    headers: new AxiosHeaders(),
    config,
  } as AxiosResponse

  return new AxiosError(
    `Request failed with status code ${status}`,
    AxiosError.ERR_BAD_REQUEST,
    config,
    {},
    response,
  )
}

/**
 * What axios throws when there was no reply at all — server down, DNS failure,
 * dropped connection, or a CORS rejection (the browser hides the real reason).
 * The giveaway is the missing `response`.
 */
export function httpNetworkError(): AxiosError {
  return new AxiosError('Network Error', AxiosError.ERR_NETWORK, config, {})
}
