import { describe, expect, it } from 'vitest'
import { summariseMonth } from './monthSummary'
import type { AttendanceDay, DayState } from '../types'

/*
  The attendance percentage is the number an employee and HR eventually
  disagree about, and the disagreement is always about the denominator. These
  tests are that denominator, written down.
*/

const NOW = new Date('2026-08-12T12:00:00.000Z')

function day(state: DayState, workedMinutes = 0): AttendanceDay {
  return {
    workDate: '2026-08-03',
    state,
    sessions:
      workedMinutes > 0
        ? [
            {
              id: 1,
              checkInAt: new Date(NOW.getTime() - workedMinutes * 60_000),
              checkOutAt: NOW,
              mode: 'office',
              locationLabel: null,
            },
          ]
        : [],
    policy: {
      requiredMinutes: 480,
      halfDayMinutes: 240,
      regularizationWindowDays: 7,
    },
    holidayName: null,
  }
}

describe('summariseMonth', () => {
  it('excludes weekends and holidays from the working days', () => {
    // A five-day week that counted weekends would report 71% attendance for a
    // perfect month, and somebody would be asked to explain it.
    const summary = summariseMonth(
      [day('completed', 480), day('weekend'), day('weekend'), day('holiday')],
      NOW,
    )

    expect(summary.workingDays).toBe(1)
    expect(summary.holidayDays).toBe(1)
    expect(summary.attendancePercent).toBe(100)
  })

  it('excludes approved leave from the denominator, not counting it absent', () => {
    // Someone who took a fortnight of earned leave did not have 50%
    // attendance. They had leave, which the company granted.
    const summary = summariseMonth([day('completed', 480), day('leave')], NOW)

    expect(summary.workingDays).toBe(1)
    expect(summary.leaveDays).toBe(1)
    expect(summary.attendancePercent).toBe(100)
  })

  it('counts a half day as half a day, not a whole one', () => {
    const summary = summariseMonth([day('completed', 480), day('half_day', 240)], NOW)

    expect(summary.workingDays).toBe(2)
    // Rounding 1.5 up to 2 is how payroll disputes start.
    expect(summary.presentDays).toBe(1.5)
    expect(summary.attendancePercent).toBe(75)
  })

  it('treats a pending regularisation as a working day that is not yet present', () => {
    // Crediting it optimistically means the number *drops* when a manager
    // rejects it — the worst possible moment for a surprise.
    const summary = summariseMonth(
      [day('completed', 480), day('regularization_pending')],
      NOW,
    )

    expect(summary.pendingRegularizations).toBe(1)
    expect(summary.presentDays).toBe(1)
    expect(summary.attendancePercent).toBe(50)
  })

  it('counts an approved regularisation as present', () => {
    const summary = summariseMonth([day('regularized', 480)], NOW)

    expect(summary.presentDays).toBe(1)
    expect(summary.attendancePercent).toBe(100)
  })

  it('averages over days actually worked, not over the calendar', () => {
    // Dividing by the whole month would report a four-hour average for someone
    // who worked eight-hour days with a weekend in the middle.
    const summary = summariseMonth(
      [day('completed', 480), day('completed', 420), day('weekend')],
      NOW,
    )

    expect(summary.totalWorkedMinutes).toBe(900)
    expect(summary.averageWorkedMinutes).toBe(450)
  })

  it('reports zeros rather than dividing by zero on an empty month', () => {
    const summary = summariseMonth([], NOW)

    expect(summary.attendancePercent).toBe(0)
    expect(summary.averageWorkedMinutes).toBe(0)
  })
})
