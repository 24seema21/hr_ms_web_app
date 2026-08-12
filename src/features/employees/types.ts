/**
 * An employee as the rest of the app sees them.
 *
 * camelCase, because that is what TypeScript code reads like. The API speaks
 * `address_line_1`; translating between the two happens in exactly one place —
 * `api/employeeApi.ts` — so a backend rename touches one file instead of every
 * component that renders an address.
 *
 * Two name fields, matching the `first_name` / `last_name` columns. Storing a
 * single joined `name` here would mean splitting it again to save, and there
 * is no split rule that does not eventually mangle somebody's name. Use
 * `fullNameOf()` from `../lib/employeeName` wherever one string is wanted.
 *
 * Note what is absent: no password, ever. The list endpoint does not return
 * `password_hash`, and giving the type a field for it would invite someone to
 * start carrying one around.
 */
export interface Employee {
  /** The database primary key. A number, and the only stable identifier. */
  id: number
  firstName: string
  /** May be empty: `last_name` is nullable, and mononymous people exist. */
  lastName: string
  email: string
  phone: string
  gender: string
  addressLine1: string
  addressLine2: string
  city: string
  state: string
  country: string
}

/**
 * The editable half of an employee — everything except the server-assigned id.
 *
 * `Omit<Employee, 'id'>` rather than a hand-written twin: add a field to
 * `Employee` and this follows automatically. Two hand-maintained lists would
 * drift, and the drift would show up as a column that silently stops saving.
 */
export type EmployeeInput = Omit<Employee, 'id'>

/**
 * What `POST /employee` needs: the editable fields plus an initial password.
 *
 * The password appears only here. `PUT /employee/:id` has no password field at
 * all, so the type system will not let an edit blank one out by accident —
 * that is the whole reason these are two types.
 */
export interface NewEmployee extends EmployeeInput {
  password: string
}

/**
 * The failure shape every caller of `employeeApi` can rely on, mirroring
 * `AuthError` in the auth feature.
 *
 * A dedicated class means a component can ask `error instanceof EmployeeError`
 * and know the message was written for a human — as opposed to an axios stack
 * trace, which was not.
 */
export class EmployeeError extends Error {
  readonly code: EmployeeErrorCode

  constructor(code: EmployeeErrorCode, message: string, options?: ErrorOptions) {
    super(message, options)
    this.name = 'EmployeeError'
    // Assigned in the body rather than as a constructor parameter property —
    // `erasableSyntaxOnly` in tsconfig.app.json bans those.
    this.code = code
  }
}

/*
  Five failures, because the UI genuinely responds differently to each:

  - `duplicate_email`  — the server rejected this email as already taken. The
                         form can point straight at the email field.
  - `not_found`        — the row is gone; somebody else deleted it. The list is
                         stale and needs reloading, not retrying.
  - `invalid_request`  — the server refused our payload. That is our bug: the
                         client validation and the server's disagree.
  - `network`          — no reply at all. Retrying may work; retyping will not.
  - `server`           — a 500. Nothing the user can do.
*/
export const EMPLOYEE_ERROR_CODES = [
  'duplicate_email',
  'not_found',
  'invalid_request',
  'network',
  'server',
] as const
export type EmployeeErrorCode = (typeof EMPLOYEE_ERROR_CODES)[number]
