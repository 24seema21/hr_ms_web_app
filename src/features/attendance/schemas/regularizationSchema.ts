import { z } from 'zod'

/*
  The rules a regularisation request has to satisfy, written once.

  The server will enforce the same set — it has to, since anyone can post
  whatever they like to an endpoint — but stating them here is what turns
  "rejected" into "check-out must be after check-in", before anything is sent
  and while the fields are still on screen.
*/

/**
 * A reason list, not just free text.
 *
 * Two things fall out of a fixed list that free text cannot give you: the
 * approver can triage a queue at a glance, and somebody can eventually ask
 * *why this team regularises forty times a month* and get an answer. The
 * free-text box stays, for the specifics, and is required — "Other" with no
 * explanation is not a request, it is a shrug.
 */
export const REGULARIZATION_REASONS = [
  { code: 'forgot_check_in', label: 'Forgot to check in' },
  { code: 'forgot_check_out', label: 'Forgot to check out' },
  { code: 'system_issue', label: 'System or device issue' },
  { code: 'client_visit', label: 'Client visit or field work' },
  { code: 'wfh_not_recorded', label: 'Worked from home, not recorded' },
  { code: 'other', label: 'Other' },
] as const

const REASON_CODES = REGULARIZATION_REASONS.map((reason) => reason.code)

/** `'09:30'` → minutes since midnight. The value an `<input type="time">` gives. */
export function minutesFromTimeInput(value: string): number {
  const [hours, minutes] = value.split(':').map(Number)
  return hours * 60 + minutes
}

/** The longest a single day's request may claim. */
const MAX_SHIFT_MINUTES = 16 * 60

export const regularizationSchema = z
  .object({
    checkIn: z
      .string()
      .min(1, 'Enter the time you started'),
    checkOut: z
      .string()
      .min(1, 'Enter the time you finished'),
    mode: z.enum(['office', 'remote']),
    reasonCode: z.enum(REASON_CODES as [string, ...string[]], {
      message: 'Choose a reason',
    }),
    details: z
      .string()
      .trim()
      .min(1, 'Add a short explanation')
      /*
        Twenty characters, because "forgot" is not something a manager can act
        on and every approval queue fills up with it. It is a low bar that asks
        for one sentence.
      */
      .min(20, 'Add a sentence your manager can act on (at least 20 characters)')
      .max(500, 'Keep it under 500 characters'),
  })
  /*
    Cross-field rules go in `superRefine` rather than on a single field,
    because they belong to the *pair*: "check-out must be after check-in" is
    not a fact about either box on its own, and attaching it to one of them
    puts the message under whichever field the user is less likely to fix.
  */
  .superRefine((values, context) => {
    if (!values.checkIn || !values.checkOut) return

    const start = minutesFromTimeInput(values.checkIn)
    const end = minutesFromTimeInput(values.checkOut)

    if (end <= start) {
      context.addIssue({
        code: 'custom',
        path: ['checkOut'],
        message: 'Check-out must be after check-in',
      })
      return
    }

    if (end - start > MAX_SHIFT_MINUTES) {
      context.addIssue({
        code: 'custom',
        path: ['checkOut'],
        message: 'That is longer than a working day — check the times',
      })
    }
  })

export type RegularizationFormValues = z.infer<typeof regularizationSchema>

/** A sensible starting point: the standard day, which most requests are. */
export const DEFAULT_REGULARIZATION: RegularizationFormValues = {
  checkIn: '09:30',
  checkOut: '18:15',
  mode: 'office',
  reasonCode: 'forgot_check_in',
  details: '',
}
