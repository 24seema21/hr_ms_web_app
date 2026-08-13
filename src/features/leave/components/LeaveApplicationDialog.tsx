import { useEffect, useMemo } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/Button'
import { FileField } from '@/shared/components/ui/FileField'
import { Modal } from '@/shared/components/ui/Modal'
import { SelectField } from '@/shared/components/ui/SelectField'
import { TextField } from '@/shared/components/ui/TextField'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { AlertIcon } from '@/shared/components/ui/icons'
import { formatFileSize } from '@/shared/lib/formatFileSize'
import { countWorkingDays, formatDayCount } from '../lib/leaveDates'
import {
  DAY_PORTION_PRESENTATION,
  LEAVE_TYPE_PRESENTATION,
} from '../lib/leavePresentation'
import {
  ATTACHMENT_ACCEPT,
  CERTIFICATE_THRESHOLD_DAYS,
  MAX_ATTACHMENT_BYTES,
  createLeaveApplicationSchema,
  defaultLeaveApplication,
} from '../schemas/leaveApplicationSchema'
import type { LeaveApplicationValues } from '../schemas/leaveApplicationSchema'
import { DAY_PORTIONS, LEAVE_TYPES } from '../types'
import type { LeaveBalance } from '../types'

interface LeaveApplicationDialogProps {
  todayWorkDate: string
  holidayDates: ReadonlySet<string>
  balances: LeaveBalance[]
  /** Who this is going to. Named, because "a manager" is not reassuring. */
  approverName: string
  onClose: () => void
  onSubmit: (values: LeaveApplicationValues) => Promise<void>
}

/**
 * Applying for leave.
 *
 * A modal rather than a drawer, and that follows this codebase's own rule
 * rather than taste: `Modal` is documented as the interruption — "the user
 * must finish or abandon something before the page underneath is useful
 * again" — and `Drawer` as detail *beside* a list you are still reading.
 * Applying for leave creates a record and has a wrong-way-out, so it blocks;
 * reading back a past request does not, and that one is a drawer. The
 * employee form and the regularisation dialog made the same call, and the
 * value of the pattern is entirely in it being the same everywhere.
 *
 * The form is short on purpose. Everything that can be pre-filled is, the
 * working-day count is shown live so nobody has to work out whether the public
 * holiday counts, and the one genuinely required piece of typing is the
 * sentence the approver will act on.
 */
export function LeaveApplicationDialog({
  todayWorkDate,
  holidayDates,
  balances,
  approverName,
  onClose,
  onSubmit,
}: LeaveApplicationDialogProps) {
  /*
    The schema is rebuilt only when its context changes, not on every render:
    `zodResolver` holds onto whichever instance it was given, and handing
    `useForm` a fresh object each pass is a well-worn way to lose validation
    state mid-typing.
  */
  const schema = useMemo(
    () => createLeaveApplicationSchema({ todayWorkDate, holidays: holidayDates }),
    [todayWorkDate, holidayDates],
  )

  const {
    register,
    control,
    handleSubmit,
    setValue,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LeaveApplicationValues>({
    resolver: zodResolver(schema),
    defaultValues: defaultLeaveApplication(todayWorkDate),
    // On blur, not on every keystroke: nobody needs "at least 15 characters"
    // shouted at them after typing two.
    mode: 'onBlur',
  })

  /*
    `useWatch` rather than the `watch()` returned by `useForm`.

    Two reasons, one of them enforced by the linter. `watch()` returns a fresh
    function on every render, so React Compiler refuses to memoise any
    component that calls it and silently skips the whole file. It also
    re-renders on *every* field, where `useWatch` subscribes only to the five
    named below — and the reason textarea should not re-render the date maths
    on each keystroke.
  */
  const [type, startDate, endDate, portion, attachment] = useWatch({
    control,
    name: ['type', 'startDate', 'endDate', 'portion', 'attachment'],
  })

  const isSingleDay = Boolean(startDate) && startDate === endDate

  /*
    Moving the start past the end is the single most common way to get a date
    range wrong, and answering it with a red message under the second field is
    worse than simply keeping the range valid. The end date follows the start
    when it would otherwise be left behind.
  */
  useEffect(() => {
    if (startDate && endDate && endDate < startDate) {
      setValue('endDate', startDate, { shouldValidate: true })
    }
  }, [startDate, endDate, setValue])

  /* A half day is only meaningful on one date — see the schema. */
  useEffect(() => {
    if (!isSingleDay && portion !== 'full') {
      setValue('portion', 'full', { shouldValidate: true })
    }
  }, [isSingleDay, portion, setValue])

  const workingDays = useMemo(() => {
    if (!startDate || !endDate || endDate < startDate) return 0
    return countWorkingDays(startDate, endDate, holidayDates)
  }, [startDate, endDate, holidayDates])

  const chargeableDays =
    workingDays === 0 ? 0 : portion === 'full' ? workingDays : workingDays - 0.5

  const balance = balances.find((entry) => entry.type === type)

  const submit = async (values: LeaveApplicationValues) => {
    try {
      await onSubmit(values)
      // Only close on success — a failure that discards a typed reason is the
      // fastest way to make somebody give up on the request entirely.
      onClose()
    } catch {
      setError('root', {
        message:
          'Could not send the application. Nothing was submitted — try again.',
      })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) onClose()
  }

  return (
    <Modal
      onClose={handleClose}
      eyebrow="Leave"
      title="Apply for leave"
      description="Goes to your approver as soon as you submit."
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(submit)} noValidate>
        {errors.root && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-control border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
          >
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {errors.root.message}
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <SelectField
            label="Leave type"
            autoFocus
            error={errors.type?.message}
            {...register('type')}
          >
            {LEAVE_TYPES.map((leaveType) => (
              <option key={leaveType} value={leaveType}>
                {LEAVE_TYPE_PRESENTATION[leaveType].label}
              </option>
            ))}
          </SelectField>

          {/*
            The balance for the selected type, in the space beside it. Deciding
            between casual and earned is the first thing anybody does on this
            form, and it is impossible without the two numbers.
          */}
          <div className="flex flex-col justify-center rounded-control border border-ink-200 bg-ink-50/70 px-4 py-2.5">
            <p className="type-label text-ink-500">Available</p>
            <p className="mt-0.5 text-sm text-ink-800">
              {balance?.entitledDays == null ? (
                <span className="text-ink-600">
                  Uncapped — deducted from salary
                </span>
              ) : (
                <>
                  <span className="font-semibold tabular-nums text-ink-900">
                    {Math.max(
                      0,
                      balance.entitledDays -
                        balance.usedDays -
                        balance.scheduledDays -
                        balance.pendingDays,
                    )}
                  </span>{' '}
                  of {balance.entitledDays} days left this year
                </>
              )}
            </p>
          </div>

          {/*
            `type="date"` gives the native picker on a phone and lets a
            keyboard user type the date on a desktop. A custom calendar widget
            is more code and worse at both.
          */}
          <TextField
            label="First day"
            type="date"
            error={errors.startDate?.message}
            {...register('startDate')}
          />

          <TextField
            label="Last day"
            type="date"
            min={startDate}
            error={errors.endDate?.message}
            {...register('endDate')}
          />

          <SelectField
            label="Duration"
            disabled={!isSingleDay}
            error={errors.portion?.message}
            {...register('portion')}
          >
            {DAY_PORTIONS.map((dayPortion) => (
              <option key={dayPortion} value={dayPortion}>
                {DAY_PORTION_PRESENTATION[dayPortion]}
              </option>
            ))}
          </SelectField>

          <DayCountSummary
            workingDays={workingDays}
            chargeableDays={chargeableDays}
            isSingleDay={isSingleDay}
          />

          <TextareaField
            label="Reason"
            className="sm:col-span-2"
            rows={3}
            placeholder="Family wedding in Nashik — travelling on the Friday and back on the Tuesday."
            hint="One or two sentences your approver can act on."
            error={errors.reason?.message}
            {...register('reason')}
          />

          <div className="sm:col-span-2">
            <FileField
              label="Attachment"
              accept={ATTACHMENT_ACCEPT}
              value={attachment}
              /*
                Validated on change rather than on blur: a file field has no
                meaningful blur — the picker closes and focus lands wherever it
                likes — so waiting for one leaves a too-large file sitting
                there looking accepted.
              */
              onChange={(file) =>
                setValue('attachment', file, { shouldValidate: true })
              }
              error={errors.attachment?.message}
              hint={
                type === 'sick'
                  ? `PDF, JPG or PNG up to ${formatFileSize(MAX_ATTACHMENT_BYTES)}. Required for sick leave over ${CERTIFICATE_THRESHOLD_DAYS} days.`
                  : `Optional. PDF, JPG or PNG up to ${formatFileSize(MAX_ATTACHMENT_BYTES)}.`
              }
            />
          </div>
        </div>

        {/*
          Sticky inside the scrolling body rather than in the dialog's footer
          slot, because the submit button has to stay inside the <form> for
          Enter to work. Same pattern as the employee and regularisation forms.
        */}
        <div className="sticky bottom-0 -mx-6 mt-8 flex flex-col-reverse gap-3 border-t border-ink-200 bg-surface px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            Goes to{' '}
            <span className="font-medium text-ink-800">{approverName}</span> for
            approval.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button
              variant="secondary"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Submitting…' : 'Submit application'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}

/**
 * What the range actually costs, computed live.
 *
 * This is the most reassuring thing on the form. "Mon 24th to Fri 28th" is
 * five days to a calendar and four to payroll when the Thursday is a public
 * holiday, and finding that out after approval is how somebody ends up a day
 * short. `aria-live="polite"` so the figure is announced when it changes
 * rather than only when somebody tabs onto it.
 */
function DayCountSummary({
  workingDays,
  chargeableDays,
  isSingleDay,
}: {
  workingDays: number
  chargeableDays: number
  isSingleDay: boolean
}) {
  return (
    <div
      aria-live="polite"
      className="flex flex-col justify-center rounded-control border border-brand-200 bg-brand-50/60 px-4 py-2.5"
    >
      <p className="type-label text-brand-700">This request</p>
      <p className="mt-0.5 text-sm text-ink-800">
        {workingDays === 0 ? (
          <span className="text-ink-600">Pick a valid range</span>
        ) : (
          <>
            <span className="font-semibold tabular-nums text-ink-900">
              {formatDayCount(chargeableDays)}
            </span>
            <span className="text-ink-600">
              {isSingleDay
                ? ''
                : ` · weekends and holidays excluded`}
            </span>
          </>
        )}
      </p>
    </div>
  )
}
