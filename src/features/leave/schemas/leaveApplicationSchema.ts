import { z } from 'zod'
import { formatFileSize } from '@/shared/lib/formatFileSize'
import { countWorkingDays } from '../lib/leaveDates'
import { DAY_PORTIONS, LEAVE_TYPES } from '../types'

/*
  The rules a leave application has to satisfy, written once.

  The server will enforce the same set — it has to, since anyone can post
  whatever they like to an endpoint — but stating them here is what turns
  "rejected" into "a certificate is required past two days", before anything is
  sent and while the fields are still on screen.

  This is a *factory* rather than a bare schema because two of the rules depend
  on values the module cannot hard-code: today's date, and the org's holiday
  calendar. Passing them in keeps the schema a pure function of its inputs, so
  a test can pin a Tuesday in March instead of passing on some days and failing
  on others.
*/

/** What an attachment may be. Anything else is a screenshot of a spreadsheet. */
export const ACCEPTED_ATTACHMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
] as const

/** For the file input's `accept`, which is a hint to the picker, not a rule. */
export const ATTACHMENT_ACCEPT = '.pdf,.jpg,.jpeg,.png'

export const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024

/** Past this many working days, sick leave needs a certificate. */
export const CERTIFICATE_THRESHOLD_DAYS = 2

/** How far back a request may be dated. Retrospective sick leave is real. */
const MAX_BACKDATE_DAYS = 30

/** The longest single request. Anything longer is a sabbatical conversation. */
const MAX_WORKING_DAYS = 30

export interface LeaveSchemaContext {
  /** `YYYY-MM-DD` from the server clock, never `new Date()` in a component. */
  todayWorkDate: string
  holidays: ReadonlySet<string>
}

/** Whole days between two `YYYY-MM-DD` dates. Positive when `to` is later. */
function daysApart(from: string, to: string): number {
  const fromMs = new Date(`${from}T12:00:00.000Z`).getTime()
  const toMs = new Date(`${to}T12:00:00.000Z`).getTime()
  return Math.round((toMs - fromMs) / 86_400_000)
}

export function createLeaveApplicationSchema({
  todayWorkDate,
  holidays,
}: LeaveSchemaContext) {
  return z
    .object({
      type: z.enum(LEAVE_TYPES, { message: 'Choose a leave type' }),
      startDate: z.string().min(1, 'Pick the first day'),
      endDate: z.string().min(1, 'Pick the last day'),
      portion: z.enum(DAY_PORTIONS),
      reason: z
        .string()
        .trim()
        .min(1, 'Add a reason')
        /*
          Fifteen characters, because "leave" is not something an approver can
          act on and every queue fills up with it. It is a low bar that asks
          for one short sentence.
        */
        .min(15, 'Add a sentence your approver can act on (at least 15 characters)')
        .max(500, 'Keep it under 500 characters'),
      /*
        The `File` itself, not a `FileList`. The field component hands over one
        file or null, so the schema never has to reason about an input that
        technically supports multiple and is configured not to.
      */
      attachment: z.instanceof(File).nullable(),
    })
    .superRefine((values, context) => {
      const { type, startDate, endDate, portion, attachment } = values

      if (!startDate || !endDate) return

      if (endDate < startDate) {
        context.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: 'The last day cannot be before the first',
        })
        return
      }

      /*
        Backdating. Sick leave is the case that genuinely happens after the
        fact — nobody files a request from bed — so it gets the 30-day window
        and everything else has to be booked in advance. Splitting the rule
        this way is the difference between a policy and an obstacle.
      */
      const daysInPast = daysApart(startDate, todayWorkDate)

      if (daysInPast > 0 && type !== 'sick') {
        context.addIssue({
          code: 'custom',
          path: ['startDate'],
          message: 'Only sick leave can be applied for retrospectively',
        })
      } else if (daysInPast > MAX_BACKDATE_DAYS) {
        context.addIssue({
          code: 'custom',
          path: ['startDate'],
          message: `Requests cannot be backdated more than ${MAX_BACKDATE_DAYS} days — talk to HR`,
        })
      }

      const workingDays = countWorkingDays(startDate, endDate, holidays)

      /*
        A range made entirely of weekends and holidays. Worth its own message:
        the honest answer is "there is nothing to approve here", and silently
        accepting a zero-day request is how one appears in the approver's queue
        with no days on it.
      */
      if (workingDays === 0) {
        context.addIssue({
          code: 'custom',
          path: ['endDate'],
          message:
            'That range is all weekend and public holidays — no leave is needed',
        })
        return
      }

      if (workingDays > MAX_WORKING_DAYS) {
        context.addIssue({
          code: 'custom',
          path: ['endDate'],
          message: `That is ${workingDays} working days. Split anything over ${MAX_WORKING_DAYS} into separate requests`,
        })
      }

      // A half day is a fact about one day. Applying it to a range is
      // ambiguous — which of the five mornings? — so it is simply not allowed.
      if (portion !== 'full' && startDate !== endDate) {
        context.addIssue({
          code: 'custom',
          path: ['portion'],
          message: 'A half day can only be taken on a single date',
        })
      }

      if (attachment) {
        if (attachment.size > MAX_ATTACHMENT_BYTES) {
          context.addIssue({
            code: 'custom',
            path: ['attachment'],
            message: `${formatFileSize(attachment.size)} is too large — the limit is ${formatFileSize(MAX_ATTACHMENT_BYTES)}`,
          })
        }

        if (
          !ACCEPTED_ATTACHMENT_TYPES.includes(
            attachment.type as (typeof ACCEPTED_ATTACHMENT_TYPES)[number],
          )
        ) {
          context.addIssue({
            code: 'custom',
            path: ['attachment'],
            message: 'Attach a PDF, JPG or PNG',
          })
        }
      } else if (type === 'sick' && workingDays > CERTIFICATE_THRESHOLD_DAYS) {
        /*
          Checked here rather than left to the approver, because the request
          gets refused for this and only this about a third of the time, and a
          rejection three days later is a far worse way to learn the rule than
          a message under the field.
        */
        context.addIssue({
          code: 'custom',
          path: ['attachment'],
          message: `Sick leave over ${CERTIFICATE_THRESHOLD_DAYS} days needs a medical certificate`,
        })
      }
    })
}

/*
  `z.infer` on the *return* of the factory: the schema's type does not depend
  on the context it was built with, so one exported type serves every caller.
*/
export type LeaveApplicationSchema = ReturnType<
  typeof createLeaveApplicationSchema
>
export type LeaveApplicationValues = z.infer<LeaveApplicationSchema>

/** A sensible starting point: one full day, today, unclassified. */
export function defaultLeaveApplication(
  todayWorkDate: string,
): LeaveApplicationValues {
  return {
    type: 'casual',
    startDate: todayWorkDate,
    endDate: todayWorkDate,
    portion: 'full',
    reason: '',
    attachment: null,
  }
}
