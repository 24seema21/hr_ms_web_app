import type { ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { SelectField } from '@/shared/components/ui/SelectField'
import { TextField } from '@/shared/components/ui/TextField'
import { AlertIcon } from '@/shared/components/ui/icons'
import { fullNameOf } from '../lib/employeeName'
import { EmployeeError } from '../types'
import type { Employee } from '../types'
import {
  EMPTY_EMPLOYEE_FORM,
  createEmployeeSchema,
  editEmployeeSchema,
  genderOptionsFor,
  toEmployeeFormValues,
} from '../schemas/employeeSchema'
import type { EmployeeFormValues } from '../schemas/employeeSchema'

interface EmployeeFormModalProps {
  /** `null` creates; an employee edits that employee. */
  employee: Employee | null
  onClose: () => void
  /**
   * Performs the save. Resolves on success; rejects — ideally with an
   * `EmployeeError` — on failure.
   *
   * The page owns this because it also owns the list that has to be reloaded
   * afterwards. This component's job stops at collecting valid input and
   * showing whatever went wrong.
   */
  onSave: (values: EmployeeFormValues) => Promise<void>
}

/**
 * The create/edit form, in a dialog.
 *
 * One component for both operations rather than two nearly identical ones: the
 * fields, the layout and the error handling are the same, and the differences
 * (a password field, the title, which schema validates) are three small
 * expressions. Two files would mean fixing every future bug twice.
 *
 * Eleven inputs is a lot to hand somebody in one undifferentiated stack, so
 * they are grouped into three named sections — who they are, how to reach
 * them, where they are. The grouping is real markup (`<fieldset>`/`<legend>`),
 * which is what makes a screen reader announce "Contact, group" as the user
 * arrives at the email field rather than leaving them to infer the structure
 * that sighted users get from the headings.
 *
 * This is mounted only while open, so `defaultValues` below run once per
 * opening and there is no "reset the form when the employee changes" effect to
 * get wrong.
 */
export function EmployeeFormModal({
  employee,
  onClose,
  onSave,
}: EmployeeFormModalProps) {
  const isEditing = employee !== null

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EmployeeFormValues>({
    /*
      The only real difference between creating and editing: which rules run.
      `createEmployeeSchema` demands a password; `editEmployeeSchema` has no
      opinion about the field, because the edit form never shows it and
      `updateEmployee()` never sends it.

      Both schemas infer to the same `EmployeeFormValues`, which is what lets
      one `useForm` serve both without a cast.
    */
    resolver: zodResolver(isEditing ? editEmployeeSchema : createEmployeeSchema),
    defaultValues: employee
      ? toEmployeeFormValues(employee)
      : EMPTY_EMPLOYEE_FORM,
    // Validate on blur, not on every keystroke — see LoginForm for the reason.
    mode: 'onBlur',
  })

  /*
    The option list is widened by the value the record *arrived* with, so an
    employee stored as "male" keeps that value instead of the select snapping
    to the blank placeholder and quietly rewriting their record on save.

    Computed from the prop rather than watched with `watch('gender')`: the only
    value that can ever be missing from the list is the initial one — the user
    cannot type a new value into a `<select>`, they can only pick an option
    that is already there. Reading it once avoids re-rendering the whole form
    on every change to that field, for information that cannot change.
  */
  const genderOptions = genderOptionsFor(employee?.gender ?? '')

  const onSubmit = async (values: EmployeeFormValues) => {
    try {
      await onSave(values)
      // Only close on success. Closing first would throw away everything the
      // user typed the moment the network hiccupped.
      onClose()
    } catch (caught) {
      if (caught instanceof EmployeeError && caught.code === 'duplicate_email') {
        /*
          The one server failure that belongs to a specific field. Attaching it
          to `email` puts the message directly under the input the user has to
          change, instead of in a banner at the top that says "something is
          wrong" and leaves them hunting.
        */
        setError('email', { message: caught.message })
        return
      }

      setError('root', {
        message:
          caught instanceof EmployeeError
            ? caught.message
            : 'Something went wrong. Please try again.',
      })
    }
  }

  /*
    Closing is blocked while a save is in flight.

    The request cannot be un-sent, so unmounting the form mid-save would leave
    the user with no idea whether it worked. `handleClose` is what the dialog's
    Escape key, backdrop and × all call, so one guard covers all three.
  */
  const handleClose = () => {
    if (!isSubmitting) onClose()
  }

  return (
    <Modal
      onClose={handleClose}
      eyebrow={isEditing ? `Employee #${employee.id}` : 'New record'}
      title={isEditing ? 'Edit employee' : 'Add employee'}
      description={
        isEditing
          ? `Update ${fullNameOf(employee)}'s details.`
          : 'Create a record in the employee directory.'
      }
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        {errors.root && (
          // `role="alert"` announces the failure the instant it appears —
          // without it a screen-reader user submits and hears nothing at all.
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-control border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
          >
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {errors.root.message}
          </div>
        )}

        <div className="space-y-8">
          <Section title="Identity" hint="As it should appear in the directory">
            {/*
              Two fields, because the database has two columns. Collecting one
              "full name" and splitting it on a space would guess wrong for
              every multi-word surname — and guess differently each time it is
              re-saved.
            */}
            <TextField
              label="First name"
              autoComplete="given-name"
              placeholder="Asha"
              autoFocus
              error={errors.firstName?.message}
              {...register('firstName')}
            />

            <TextField
              label="Last name"
              autoComplete="family-name"
              placeholder="Rao"
              // Optional because `last_name` is nullable and plenty of names
              // are a single word. Saying so beats a red error nobody expected.
              hint="Optional"
              error={errors.lastName?.message}
              {...register('lastName')}
            />

            <SelectField
              label="Gender"
              error={errors.gender?.message}
              {...register('gender')}
            >
              {/*
                An explicit empty option, so a blank select is a deliberate
                "not chosen yet" rather than silently defaulting to whichever
                value happens to be first.
              */}
              <option value="">Select…</option>
              {genderOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </SelectField>
          </Section>

          <Section title="Contact" hint="Used for sign-in and notifications">
            <TextField
              label="Work email"
              type="email"
              autoComplete="email"
              placeholder="asha.rao@company.com"
              className="sm:col-span-2"
              error={errors.email?.message}
              {...register('email')}
            />

            <TextField
              label="Phone"
              type="tel"
              autoComplete="tel"
              placeholder="9876543210"
              // The column is varchar(12), so `+91 98765 43210` does not fit.
              // Saying it up front beats being rejected after typing.
              hint="Up to 12 characters"
              error={errors.phone?.message}
              {...register('phone')}
            />

            {/*
              Rendered only when creating. The edit form has no password field
              at all — not a disabled one, not a blank one — because the API
              has no way to accept it, and a control that cannot do anything is
              worse than no control.
            */}
            {!isEditing && (
              <TextField
                label="Temporary password"
                type="password"
                // "new-password" tells a password manager to offer to generate
                // one, rather than autofilling the signed-in user's own.
                autoComplete="new-password"
                placeholder="At least 8 characters"
                hint="They sign in with this and should change it."
                error={errors.password?.message}
                {...register('password')}
              />
            )}
          </Section>

          <Section title="Address">
            <TextField
              label="Address line 1"
              autoComplete="address-line1"
              placeholder="Flat 4B, Orchid Residency"
              className="sm:col-span-2"
              error={errors.addressLine1?.message}
              {...register('addressLine1')}
            />

            <TextField
              label="Address line 2"
              autoComplete="address-line2"
              placeholder="Baner Road"
              className="sm:col-span-2"
              // The only field that may be left blank, so it says so —
              // otherwise people fill it in with a dash to be safe.
              hint="Optional"
              error={errors.addressLine2?.message}
              {...register('addressLine2')}
            />

            <TextField
              label="City"
              autoComplete="address-level2"
              placeholder="Pune"
              error={errors.city?.message}
              {...register('city')}
            />

            <TextField
              label="State"
              autoComplete="address-level1"
              placeholder="Maharashtra"
              error={errors.state?.message}
              {...register('state')}
            />

            <TextField
              label="Country"
              autoComplete="country-name"
              placeholder="India"
              className="sm:col-span-2"
              error={errors.country?.message}
              {...register('country')}
            />
          </Section>
        </div>

        {/*
          The action row is sticky to the bottom of the scrolling body rather
          than living in the dialog's footer slot — because it has to stay
          *inside* the `<form>` for `type="submit"` to submit it, and for Enter
          in a text field to do the same. Sticky gets both: the buttons are
          always on screen, and the form owns them.

          `-mx-6` bleeds it to the panel edges, and there is deliberately no
          matching `-mb`: a negative *bottom* margin on a sticky element pins
          its margin box, which lifts the visible bar a few pixels off the
          bottom and leaves a strip of scrolling form fields sliding past
          underneath it.
        */}
        <div className="sticky bottom-0 -mx-6 mt-8 flex flex-col-reverse gap-3 border-t border-ink-200 bg-surface px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            onClick={handleClose}
            // Nothing to cancel once the request has left; the button would be
            // a lie.
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          {/*
            `type="submit"` is what makes Enter in a text field save the form —
            Button defaults to "button" precisely so that this has to be
            deliberate.
          */}
          <Button type="submit" isLoading={isSubmitting}>
            {isSubmitting
              ? 'Saving…'
              : isEditing
                ? 'Save changes'
                : 'Create employee'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}

/**
 * A named group of fields.
 *
 * `<fieldset>`/`<legend>` rather than a heading and a div: the legend is
 * announced when focus enters any field inside the group, so a screen-reader
 * user hears "Address, group, City, edit text" and knows where they are. A
 * visual heading tells them nothing.
 */
function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: ReactNode
}) {
  return (
    <fieldset className="min-w-0">
      <legend className="type-label text-brand-600">{title}</legend>
      {hint && <p className="mt-1 text-xs text-ink-500">{hint}</p>}
      <div className="mt-4 grid gap-5 sm:grid-cols-2">{children}</div>
    </fieldset>
  )
}
