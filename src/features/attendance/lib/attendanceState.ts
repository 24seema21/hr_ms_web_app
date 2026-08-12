import { totalsForDay } from './workedMinutes'
import type { AttendanceDay, DayState } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  ONE FUNCTION DECIDES WHAT STATE A DAY IS IN
  ─────────────────────────────────────────────────────────────────────────────
  The button, the status pill, the weekly row's action and the API guard all
  ask these two functions. Three components each deciding for themselves
  whether a day counts as "on break" is three chances to disagree, and the one
  that disagrees is always the one holding the destructive action.
*/

/**
 * States the server has already settled and the client must not second-guess.
 *
 * A holiday does not become "not checked in" because nobody clocked in, and an
 * approved leave day is not an absence. These are assigned when the day is
 * generated or a request is approved, and no amount of clock-watching in the
 * browser changes them.
 */
const SETTLED_STATES: readonly DayState[] = [
  'weekend',
  'holiday',
  'leave',
  'absent',
  'half_day',
  'regularization_pending',
  'regularized',
  'regularization_rejected',
]

/**
 * The live state of a day: the server's opinion, refined by the clock for the
 * one day where the clock still matters.
 */
export function dayStateOf(day: AttendanceDay, now: Date): DayState {
  if (SETTLED_STATES.includes(day.state)) return day.state

  const { openSession, totalMinutes } = totalsForDay(day, now)

  if (openSession !== null) return 'working'
  if (day.sessions.length === 0) return 'not_checked_in'

  /*
    Closed sessions, no open one. "Completed" once the required minutes are in,
    "on break" before that — because the difference is whether the card offers
    to check them back in, and telling somebody they are done at 3h 45m is how
    an afternoon goes unrecorded.

    Note that this never returns `absent`: today cannot be an absence while it
    is still today. Only the nightly close job may decide that.
  */
  return totalMinutes >= day.policy.requiredMinutes ? 'completed' : 'on_break'
}

export type AttendanceAction = 'check_in' | 'check_out' | 'regularize' | 'view' | 'none'

/**
 * The one action this day offers, given its state.
 *
 * Returns the *action*, not a label or a handler — presentation belongs to the
 * button, and the same answer drives the weekly table's row action, where the
 * wording is different but the rule is identical.
 */
export function primaryActionFor(state: DayState): AttendanceAction {
  switch (state) {
    case 'not_checked_in':
    case 'on_break':
      return 'check_in'

    case 'working':
      return 'check_out'

    /*
      A day that finished wrong. `regularize` is offered here and nowhere else;
      whether it is *allowed* is a policy question (the window, the monthly
      cap, whether one is already pending) that `canRegularize` answers in
      phase 3c.
    */
    case 'absent':
    case 'half_day':
    case 'regularization_rejected':
      return 'regularize'

    case 'completed':
    case 'regularized':
    case 'regularization_pending':
    case 'leave':
      return 'view'

    /* Nothing was owed, so nothing is offered. */
    case 'weekend':
    case 'holiday':
      return 'none'
  }
}

/**
 * True when checking out now would leave the day short.
 *
 * Drives the one confirmation this flow has. Confirming *every* check-out
 * trains people to dismiss the dialog without reading it, at which point it
 * has stopped protecting the one case it existed for.
 */
export function wouldCheckOutEarly(day: AttendanceDay, now: Date): boolean {
  const { openSession, remainingMinutes } = totalsForDay(day, now)
  return openSession !== null && remainingMinutes > 0
}
