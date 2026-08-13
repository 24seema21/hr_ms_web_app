import { describe, expect, it } from 'vitest'
import { createLeaveApplicationSchema } from './leaveApplicationSchema'

/*
  Pure unit tests: no React, no DOM, no rendering.

  The schema is a factory over `todayWorkDate` and the holiday calendar
  precisely so these can pin a date instead of passing on some days and failing
  on others — a rule about backdating tested against the real clock is a test
  that breaks on a Monday.

  The pinned week, for reference:

    Mon 2026-08-10   Thu 2026-08-13  ← "today" in every test below
    Tue 2026-08-11   Fri 2026-08-14
    Wed 2026-08-12   Sat 2026-08-15  ← Independence Day (holiday AND weekend)
                     Sun 2026-08-16
*/

const TODAY = '2026-08-13'
const HOLIDAYS = new Set(['2026-08-15', '2026-08-31'])

const schema = createLeaveApplicationSchema({
  todayWorkDate: TODAY,
  holidays: HOLIDAYS,
})

/** A valid application, with only the fields under test overridden. */
function validValues(overrides: Record<string, unknown> = {}) {
  return {
    type: 'casual',
    startDate: '2026-08-17',
    endDate: '2026-08-17',
    portion: 'full',
    reason: 'Passport renewal appointment at the Seva Kendra.',
    attachment: null,
    ...overrides,
  }
}

/** The message Zod reported for a field, or undefined if it passed. */
function errorFor(values: unknown, field: string): string | undefined {
  const result = schema.safeParse(values)
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('leaveApplicationSchema', () => {
  it('accepts a plain one-day request in the future', () => {
    expect(schema.safeParse(validValues()).success).toBe(true)
  })

  describe('the date range', () => {
    it('rejects an end date before the start', () => {
      expect(
        errorFor(
          validValues({ startDate: '2026-08-20', endDate: '2026-08-18' }),
          'endDate',
        ),
      ).toBe('The last day cannot be before the first')
    })

    it('accepts a range that spans a weekend', () => {
      // Fri 21st to Mon 24th — two working days, and legal.
      expect(
        schema.safeParse(
          validValues({ startDate: '2026-08-21', endDate: '2026-08-24' }),
        ).success,
      ).toBe(true)
    })

    it('rejects a range made entirely of weekend and holidays', () => {
      // Sat 15th (a holiday) to Sun 16th — nothing to approve.
      expect(
        errorFor(
          validValues({ startDate: '2026-08-15', endDate: '2026-08-16' }),
          'endDate',
        ),
      ).toBe('That range is all weekend and public holidays — no leave is needed')
    })

    it('rejects a request longer than the 30 working-day cap', () => {
      expect(
        errorFor(
          validValues({ startDate: '2026-08-17', endDate: '2026-10-30' }),
          'endDate',
        ),
      ).toMatch(/Split anything over 30/)
    })
  })

  describe('backdating', () => {
    it('rejects retrospective casual leave', () => {
      expect(
        errorFor(
          validValues({ startDate: '2026-08-10', endDate: '2026-08-10' }),
          'startDate',
        ),
      ).toBe('Only sick leave can be applied for retrospectively')
    })

    it('accepts retrospective sick leave inside the window', () => {
      expect(
        schema.safeParse(
          validValues({
            type: 'sick',
            startDate: '2026-08-10',
            endDate: '2026-08-10',
          }),
        ).success,
      ).toBe(true)
    })

    it('rejects sick leave backdated beyond 30 days', () => {
      expect(
        errorFor(
          validValues({
            type: 'sick',
            startDate: '2026-06-01',
            endDate: '2026-06-01',
          }),
          'startDate',
        ),
      ).toMatch(/cannot be backdated more than 30 days/)
    })

    it('treats a request starting today as neither past nor backdated', () => {
      expect(
        schema.safeParse(validValues({ startDate: TODAY, endDate: TODAY }))
          .success,
      ).toBe(true)
    })
  })

  describe('half days', () => {
    it('accepts a portion on a single date', () => {
      expect(
        schema.safeParse(validValues({ portion: 'first_half' })).success,
      ).toBe(true)
    })

    it('rejects a portion across a multi-day range', () => {
      expect(
        errorFor(
          validValues({
            portion: 'second_half',
            startDate: '2026-08-17',
            endDate: '2026-08-19',
          }),
          'portion',
        ),
      ).toBe('A half day can only be taken on a single date')
    })
  })

  describe('the reason', () => {
    it('reports whitespace-only input as required, not as too short', () => {
      // Proves `.trim()` runs before the length check.
      expect(errorFor(validValues({ reason: '   ' }), 'reason')).toBe(
        'Add a reason',
      )
    })

    it('rejects a reason nobody could act on', () => {
      expect(errorFor(validValues({ reason: 'leave' }), 'reason')).toMatch(
        /at least 15 characters/,
      )
    })
  })

  describe('attachments', () => {
    const certificate = () =>
      new File(['x'], 'certificate.pdf', { type: 'application/pdf' })

    it('requires a certificate for sick leave over two working days', () => {
      expect(
        errorFor(
          validValues({
            type: 'sick',
            startDate: '2026-08-17',
            endDate: '2026-08-19',
          }),
          'attachment',
        ),
      ).toBe('Sick leave over 2 days needs a medical certificate')
    })

    it('accepts the same request once a certificate is attached', () => {
      expect(
        schema.safeParse(
          validValues({
            type: 'sick',
            startDate: '2026-08-17',
            endDate: '2026-08-19',
            attachment: certificate(),
          }),
        ).success,
      ).toBe(true)
    })

    it('does not require one for short sick leave', () => {
      expect(
        schema.safeParse(
          validValues({
            type: 'sick',
            startDate: '2026-08-17',
            endDate: '2026-08-18',
          }),
        ).success,
      ).toBe(true)
    })

    it('counts working days, not calendar days, against the threshold', () => {
      /*
        Fri 21st to Mon 24th is four calendar days but only two working ones,
        so it sits under the threshold. This is the case a naive date
        subtraction gets wrong.
      */
      expect(
        schema.safeParse(
          validValues({
            type: 'sick',
            startDate: '2026-08-21',
            endDate: '2026-08-24',
          }),
        ).success,
      ).toBe(true)
    })

    it('rejects a file of the wrong type', () => {
      expect(
        errorFor(
          validValues({
            attachment: new File(['x'], 'notes.txt', { type: 'text/plain' }),
          }),
          'attachment',
        ),
      ).toBe('Attach a PDF, JPG or PNG')
    })

    it('rejects a file over the size limit', () => {
      const huge = new File([new Uint8Array(6 * 1024 * 1024)], 'scan.pdf', {
        type: 'application/pdf',
      })

      expect(errorFor(validValues({ attachment: huge }), 'attachment')).toMatch(
        /is too large — the limit is 5 MB/,
      )
    })
  })
})
