import { z } from 'zod'
import type { Employee, EmployeeInput } from '../types'

/*
  One schema module, two rule sets, a single TypeScript type.

  Creating an employee needs a password; editing one must not send a password
  at all (see `UpdateEmployeeRequest` in the Go models). Rather than two forms
  or a pile of `if (mode === 'create')` checks scattered through the component,
  the difference is expressed here: `createEmployeeSchema` demands a password,
  `editEmployeeSchema` ignores whatever is in that field.

  Both infer to the *same* `EmployeeFormValues` type, which is what lets one
  `useForm<EmployeeFormValues>()` swap its resolver between them without a
  single cast.
*/

/**
 * The gender values the form offers.
 *
 * `as const` + a derived union rather than an `enum` — `erasableSyntaxOnly` in
 * tsconfig.app.json bans enums, and this way the array is something the
 * `<select>` can `.map()` over directly.
 *
 * The database column is a free-text string, so a row written before this list
 * existed may hold something else entirely. `genderOptionsFor()` below is what
 * stops that value being silently rewritten the first time someone opens the
 * edit form.
 */
export const GENDER_OPTIONS = ['Male', 'Female', 'Other'] as const

/*
  ─────────────────────────────────────────────────────────────────────────────
  Every `.max()` below is a column width from the `Employee` table, not a
  number somebody liked the look of.

    first_name / last_name  varchar(100)
    email                   varchar(100)
    phone                   varchar(12)
    gender                  varchar(20)
    address_line_1 / _2     varchar(200)
    city / state / country  varchar(200)

  MySQL runs in strict mode by default, so an over-long value does not get
  quietly truncated — the whole INSERT is rejected with "Data too long for
  column", and the API can only report a generic 500. Checking here means the
  user is told which field is too long, before they press Save.
  ─────────────────────────────────────────────────────────────────────────────
*/

/**
 * Deliberately permissive: digits, spaces, `+`, `-`, `(`, `)`, 7–12 characters.
 *
 * A stricter pattern is a trap — phone numbers are formatted a dozen different
 * ways across countries, and a regex that accepts only one of them rejects
 * real people. The 12-character ceiling is not a style choice though: the
 * column is `varchar(12)`, which fits `919876543210` but not
 * `+91 98765 43210`.
 */
const PHONE_PATTERN = /^[0-9+\-\s()]{7,12}$/

const employeeFieldsSchema = z.object({
  firstName: z
    .string()
    .trim()
    // Checks run in order, so an empty field says "required" rather than the
    // less helpful "must be at least 2 characters".
    .min(1, 'First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(100, 'First name must be 100 characters or fewer'),

  /*
    Optional, and that is deliberate rather than an oversight.

    `last_name` is nullable in the schema, and mononymous people exist —
    plenty of names in India, Indonesia and Myanmar are a single word. Making
    the field mandatory would mean those employees cannot be entered truthfully,
    and somebody types a dot to get past the validation.
  */
  lastName: z
    .string()
    .trim()
    .max(100, 'Last name must be 100 characters or fewer'),

  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(100, 'Email must be 100 characters or fewer')
    .pipe(z.email('Enter a valid email address')),

  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .regex(PHONE_PATTERN, 'Enter a valid phone number, up to 12 characters'),

  gender: z
    .string()
    .trim()
    .min(1, 'Select a gender')
    .max(20, 'Gender must be 20 characters or fewer'),

  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(200, 'Address must be 200 characters or fewer'),

  // Genuinely optional: plenty of addresses are one line.
  addressLine2: z
    .string()
    .trim()
    .max(200, 'Address must be 200 characters or fewer'),

  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(200, 'City must be 200 characters or fewer'),

  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .max(200, 'State must be 200 characters or fewer'),

  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(200, 'Country must be 200 characters or fewer'),
})

/**
 * Editing: the password field exists in the form's value object but carries no
 * rules, because the edit form never renders it and `updateEmployee()` never
 * sends it.
 */
export const editEmployeeSchema = employeeFieldsSchema.extend({
  password: z.string(),
})

/**
 * Creating: the same fields, with the password now required.
 *
 * The 8-character minimum belongs *here* and not on the login form. This is
 * where a password is chosen, so the rule shapes something; on a sign-in form
 * the password already exists and a length check can only lock out an older
 * account while telling an attacker what to guess.
 */
export const createEmployeeSchema = employeeFieldsSchema.extend({
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .max(72, 'Password must be 72 characters or fewer'),
})

/**
 * `{ name: string; email: string; …; password: string }`.
 *
 * Written once, in the schema, and never by hand — so adding a field cannot
 * leave the type and the validation disagreeing.
 */
export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>

/** A blank form. Every field is a string, never `undefined`. */
export const EMPTY_EMPLOYEE_FORM: EmployeeFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  phone: '',
  gender: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  country: '',
}

/**
 * An existing employee, as form values.
 *
 * `password` is blank because the server never sends one back and the edit
 * form never asks for one. Note that every field is coerced through `?? ''`
 * upstream in the API layer, so React never sees `value={undefined}` — which
 * is what silently turns a controlled input into an uncontrolled one and
 * produces the "changing an uncontrolled input to be controlled" warning.
 */
export function toEmployeeFormValues(employee: Employee): EmployeeFormValues {
  return {
    firstName: employee.firstName,
    lastName: employee.lastName,
    email: employee.email,
    password: '',
    phone: employee.phone,
    gender: employee.gender,
    addressLine1: employee.addressLine1,
    addressLine2: employee.addressLine2,
    city: employee.city,
    state: employee.state,
    country: employee.country,
  }
}

/**
 * Form values, as the API layer wants them: the nine editable fields, with the
 * password dropped.
 *
 * The password is removed *by construction* — the object is built field by
 * field rather than spread and deleted — so `updateEmployee()` cannot be handed
 * one by accident. `EmployeeInput` has no password field, so leaving it in
 * would be a type error, which is the point.
 */
export function toEmployeeInput(values: EmployeeFormValues): EmployeeInput {
  return {
    firstName: values.firstName,
    lastName: values.lastName,
    email: values.email,
    phone: values.phone,
    gender: values.gender,
    addressLine1: values.addressLine1,
    addressLine2: values.addressLine2,
    city: values.city,
    state: values.state,
    country: values.country,
  }
}

/**
 * The `<option>` list for the gender select, widened to include whatever the
 * record already holds.
 *
 * Without this, opening the edit form for an employee stored as `"male"` would
 * show the select sitting on the blank placeholder, and saving would quietly
 * overwrite their record. A dropdown must never be able to change data just by
 * being displayed.
 */
export function genderOptionsFor(currentValue: string): string[] {
  const options: string[] = [...GENDER_OPTIONS]
  const current = currentValue.trim()

  if (current !== '' && !options.includes(current)) {
    options.push(current)
  }

  return options
}
