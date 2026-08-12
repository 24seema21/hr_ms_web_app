/*
  ─────────────────────────────────────────────────────────────────────────────
  THE SERVER IS THE CLOCK
  ─────────────────────────────────────────────────────────────────────────────
  `Date.now()` is not allowed to decide anything in this module.

  A device clock can be minutes or hours out — deliberately (someone changed it
  to dodge a deadline), accidentally (a dead CMOS battery, a VM resuming from
  sleep), or benignly (NTP has not run yet after boot). Any of those turn into
  wrong hours on a timesheet, and the employee is the one who has to argue
  about it later.

  So: the *server* stamps every check-in and check-out, and every response
  carries `server_time`. This module remembers the difference between that and
  the local clock, and `serverNow()` applies it. The offset is usually a few
  milliseconds and occasionally a shock.

  A module-level singleton rather than context: it is read inside a one-second
  interval and by pure helpers, none of which should need a React provider to
  ask what time it is.
*/

/** `serverTime − localTime`, in milliseconds. Zero until the first response. */
let offsetMs = 0
let hasSynced = false

/** Beyond this, the device clock is wrong enough to tell the user about. */
const SKEW_WARNING_MS = 120_000

/**
 * Record the server's clock from a response. Called by `attendanceApi` on
 * every request that carries `server_time`.
 */
export function syncServerClock(serverTime: Date): void {
  offsetMs = serverTime.getTime() - Date.now()
  hasSynced = true
}

/** Now, according to the server. Use this everywhere instead of `new Date()`. */
export function serverNow(): Date {
  return new Date(Date.now() + offsetMs)
}

/**
 * True when the device clock is more than two minutes from the server's.
 *
 * Worth surfacing quietly ("your device clock looks wrong") because it also
 * breaks TLS, calendars and everything else the person is about to complain
 * about — and because it explains why the timer on screen once jumped.
 */
export function hasClockSkew(): boolean {
  return hasSynced && Math.abs(offsetMs) > SKEW_WARNING_MS
}

/** The current offset, for diagnostics and tests. */
export function clockOffsetMs(): number {
  return offsetMs
}

/** Test-only reset, so one spec's fake clock cannot leak into the next. */
export function resetServerClock(): void {
  offsetMs = 0
  hasSynced = false
}
