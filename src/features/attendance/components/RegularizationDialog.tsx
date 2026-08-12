import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { SelectField } from '@/shared/components/ui/SelectField'
import { TextField } from '@/shared/components/ui/TextField'
import { TextareaField } from '@/shared/components/ui/TextareaField'
import { AlertIcon } from '@/shared/components/ui/icons'
import { formatFullDay } from '../lib/duration'
import { STATE_PRESENTATION } from '../lib/statePresentation'
import { parseWorkDate } from '../lib/workDate'
import {
  DEFAULT_REGULARIZATION,
  REGULARIZATION_REASONS,
  regularizationSchema,
} from '../schemas/regularizationSchema'
import type { RegularizationFormValues } from '../schemas/regularizationSchema'
import type { AttendanceDay } from '../types'

interface RegularizationDialogProps {
  day: AttendanceDay
  /** Who this is going to. Named, because "a manager" is not reassuring. */
  approverName: string
  onClose: () => void
  onSubmit: (values: RegularizationFormValues) => Promise<void>
}

/**
 * Asking a manager to correct a day's attendance.
 *
 * The form is short on purpose — five fields — because it is filled in by
 * somebody who is already annoyed that they have to. Everything that can be
 * pre-filled is: the standard working hours, their usual mode, the most common
 * reason. What cannot be guessed is the sentence explaining it, and that is
 * the one required piece of typing.
 */
export function RegularizationDialog({
  day,
  approverName,
  onClose,
  onSubmit,
}: RegularizationDialogProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegularizationFormValues>({
    resolver: zodResolver(regularizationSchema),
    defaultValues: DEFAULT_REGULARIZATION,
    // On blur, not on every keystroke: nobody needs "at least 20 characters"
    // shouted at them after typing two.
    mode: 'onBlur',
  })

  const submit = async (values: RegularizationFormValues) => {
    try {
      await onSubmit(values)
      // Only close on success — a failure that discards a typed explanation is
      // the fastest way to make somebody give up on the request entirely.
      onClose()
    } catch {
      setError('root', {
        message: 'Could not send the request. Nothing was submitted — try again.',
      })
    }
  }

  const handleClose = () => {
    if (!isSubmitting) onClose()
  }

  return (
    <Modal
      onClose={handleClose}
      eyebrow="Regularisation"
      title={`Regularise ${formatFullDay(parseWorkDate(day.workDate))}`}
      className="max-w-xl"
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

        {/* What is on record now — the thing being corrected, stated plainly
            so the request is made against a fact rather than a memory. */}
        <div className="flex flex-wrap items-center gap-3 rounded-control border border-ink-200 bg-ink-50/70 px-4 py-3">
          <span className="type-label text-ink-500">Currently</span>
          <Badge tone={day.state === 'absent' ? 'danger' : 'accent'}>
            {STATE_PRESENTATION[day.state].label}
          </Badge>
          <span className="text-sm text-ink-600">
            {day.sessions.length === 0
              ? 'No sessions recorded'
              : `${day.sessions.length} session${day.sessions.length === 1 ? '' : 's'} recorded`}
          </span>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/*
            `type="time"` gives the native picker on a phone and lets a
            keyboard user type "0930" on a desktop. A pair of dropdowns for
            hours and minutes is more code and worse at both.
          */}
          <TextField
            label="Requested check-in"
            type="time"
            autoFocus
            error={errors.checkIn?.message}
            {...register('checkIn')}
          />

          <TextField
            label="Requested check-out"
            type="time"
            error={errors.checkOut?.message}
            {...register('checkOut')}
          />

          <SelectField
            label="Mode"
            error={errors.mode?.message}
            {...register('mode')}
          >
            <option value="office">Office</option>
            <option value="remote">Remote</option>
          </SelectField>

          <SelectField
            label="Reason"
            error={errors.reasonCode?.message}
            {...register('reasonCode')}
          >
            {REGULARIZATION_REASONS.map((reason) => (
              <option key={reason.code} value={reason.code}>
                {reason.label}
              </option>
            ))}
          </SelectField>

          <TextareaField
            label="Details"
            className="sm:col-span-2"
            rows={3}
            placeholder="Was in the Pune office all day — the badge log will confirm it."
            hint="One sentence your manager can act on."
            error={errors.details?.message}
            {...register('details')}
          />
        </div>

        {/*
          Sticky inside the scrolling body rather than in the dialog's footer
          slot, because the submit button has to stay inside the <form> for
          Enter to work. Same pattern as the employee form.
        */}
        <div className="sticky bottom-0 -mx-6 mt-8 flex flex-col-reverse gap-3 border-t border-ink-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-500">
            Goes to <span className="font-medium text-ink-800">{approverName}</span>{' '}
            for approval.
          </p>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {isSubmitting ? 'Sending…' : 'Submit request'}
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  )
}
