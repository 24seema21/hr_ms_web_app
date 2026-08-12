import { describe, expect, it } from 'vitest'
import { formatDuration, minutesBetween, spellDuration } from './duration'
import { workedTotals } from './workedMinutes'
import { dayStateOf, primaryActionFor, wouldCheckOutEarly } from './attendanceState'
import type { AttendanceDay, AttendanceSession, DayState } from '../types'

/*
  The three pure modules the whole feature rests on, tested without a clock, a
  render or a network. Every case below is one that produces a visible bug:
  hours that go backwards, a day that says "completed" at lunchtime, a timer
  that loses forty minutes to a sleeping laptop.
*/

const NOW = new Date('2026-08-12T12:00:00.000Z')

function at(offsetMinutes: number): Date {
  return new Date(NOW.getTime() + offsetMinutes * 60_000)
}

function session(
  id: number,
  fromMinutes: number,
  toMinutes: number | null,
  overrides: Partial<AttendanceSession> = {},
): AttendanceSession {
  return {
    id,
    checkInAt: at(fromMinutes),
    checkOutAt: toMinutes === null ? null : at(toMinutes),
    mode: 'office',
    locationLabel: null,
    ...overrides,
  }
}

function day(
  sessions: AttendanceSession[],
  state: DayState = 'working',
): AttendanceDay {
  return {
    workDate: '2026-08-12',
    state,
    sessions,
    policy: {
      requiredMinutes: 480,
      halfDayMinutes: 240,
      regularizationWindowDays: 7,
    },
    holidayName: null,
  }
}

describe('formatDuration', () => {
  it('formats hours and minutes the way a timesheet reads', () => {
    expect(formatDuration(0)).toBe('0m')
    expect(formatDuration(45)).toBe('45m')
    expect(formatDuration(60)).toBe('1h')
    expect(formatDuration(405)).toBe('6h 45m')
    // Zero-padded so a column of figures lines up: 8h 05m under 8h 45m.
    expect(formatDuration(485)).toBe('8h 05m')
  })

  it('never renders a negative duration', () => {
    expect(formatDuration(-30)).toBe('0m')
  })
})

describe('spellDuration', () => {
  it('spells it out for screen readers, which read "6h 45m" as gibberish', () => {
    expect(spellDuration(405)).toBe('6 hours 45 minutes')
    expect(spellDuration(60)).toBe('1 hour')
    expect(spellDuration(1)).toBe('1 minute')
    expect(spellDuration(0)).toBe('0 minutes')
  })
})

describe('minutesBetween', () => {
  it('floors partial minutes rather than rounding them up', () => {
    // Rounding up pays for a minute nobody worked, on every session, twice a
    // day. Over a month that is real money in the wrong direction.
    const from = new Date('2026-08-12T09:00:00.000Z')
    expect(minutesBetween(from, new Date('2026-08-12T09:44:55.000Z'))).toBe(44)
  })

  it('clamps a check-out that precedes its check-in to zero', () => {
    // Happens when a server clock is corrected mid-shift. `-17m` looks like an
    // app bug and quietly poisons every total it is added to.
    expect(minutesBetween(at(60), at(30))).toBe(0)
  })
})

describe('workedTotals', () => {
  it('sums closed sessions', () => {
    const totals = workedTotals(
      [session(1, -405, -180), session(2, -150, -30)],
      480,
      NOW,
    )

    expect(totals.totalMinutes).toBe(225 + 120)
    expect(totals.currentMinutes).toBeNull()
    expect(totals.openSession).toBeNull()
  })

  it('measures an open session up to now, so the total keeps moving', () => {
    const totals = workedTotals([session(1, -225, -60), session(2, -30, null)], 480, NOW)

    expect(totals.currentMinutes).toBe(30)
    expect(totals.totalMinutes).toBe(165 + 30)
    expect(totals.remainingMinutes).toBe(480 - 195)
    expect(totals.openSession?.id).toBe(2)
  })

  it('reports overtime instead of a negative remainder', () => {
    const totals = workedTotals([session(1, -540, -30)], 480, NOW)

    expect(totals.totalMinutes).toBe(510)
    expect(totals.remainingMinutes).toBe(0)
    expect(totals.overtimeMinutes).toBe(30)
    // The ratio is left un-clamped on purpose — the bar clamps, the number is
    // honest, and "106%" is a true thing to say about a long day.
    expect(totals.ratio).toBeCloseTo(510 / 480)
  })

  it('handles a day with nothing in it', () => {
    const totals = workedTotals([], 480, NOW)

    expect(totals.totalMinutes).toBe(0)
    expect(totals.remainingMinutes).toBe(480)
    expect(totals.openSession).toBeNull()
  })
})

describe('dayStateOf', () => {
  it('is "working" whenever a session is open', () => {
    expect(dayStateOf(day([session(1, -30, null)]), NOW)).toBe('working')
  })

  it('is "not checked in" with no sessions at all', () => {
    expect(dayStateOf(day([], 'not_checked_in'), NOW)).toBe('not_checked_in')
  })

  it('is "on break" when the day is short and nothing is running', () => {
    // The distinction that matters: this is what keeps the card offering to
    // check them back in after lunch instead of declaring the day over.
    expect(dayStateOf(day([session(1, -225, -30)]), NOW)).toBe('on_break')
  })

  it('is "completed" once the required minutes are in', () => {
    expect(dayStateOf(day([session(1, -540, -30)]), NOW)).toBe('completed')
  })

  it('never overrides a state the server has settled', () => {
    // A holiday does not become "not checked in" because nobody clocked in,
    // and an approved leave day is not an absence.
    for (const settled of ['holiday', 'weekend', 'leave', 'absent'] as const) {
      expect(dayStateOf(day([], settled), NOW)).toBe(settled)
    }
  })
})

describe('primaryActionFor', () => {
  it('offers exactly one action per state', () => {
    expect(primaryActionFor('not_checked_in')).toBe('check_in')
    expect(primaryActionFor('on_break')).toBe('check_in')
    expect(primaryActionFor('working')).toBe('check_out')
    expect(primaryActionFor('absent')).toBe('regularize')
    expect(primaryActionFor('half_day')).toBe('regularize')
    expect(primaryActionFor('regularization_rejected')).toBe('regularize')
    expect(primaryActionFor('completed')).toBe('view')
    expect(primaryActionFor('regularization_pending')).toBe('view')
    // Nothing was owed, so nothing is offered.
    expect(primaryActionFor('weekend')).toBe('none')
    expect(primaryActionFor('holiday')).toBe('none')
  })
})

describe('wouldCheckOutEarly', () => {
  it('is true only while a session is open and the day is short', () => {
    expect(wouldCheckOutEarly(day([session(1, -60, null)]), NOW)).toBe(true)
    // Required hours met — no confirmation, because a dialog on every
    // check-out is one people learn to click through.
    expect(wouldCheckOutEarly(day([session(1, -500, null)]), NOW)).toBe(false)
    // Nothing running: there is no check-out to confirm.
    expect(wouldCheckOutEarly(day([session(1, -60, -30)]), NOW)).toBe(false)
  })
})
