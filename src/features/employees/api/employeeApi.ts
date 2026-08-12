import {
  httpClient,
  httpStatusOf,
  isNetworkError,
  readApiMessage,
} from '@/shared/lib/httpClient'
import { EmployeeError } from '../types'
import type { Employee, EmployeeInput, NewEmployee } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE EMPLOYEE DATA BOUNDARY
  ─────────────────────────────────────────────────────────────────────────────
  Same shape as `auth/api/authApi.ts`, for the same reason: this is the only
  file in the feature that knows HTTP exists. Components above it deal in
  `Employee` objects and `EmployeeError`s, and would not notice if the backend
  moved to GraphQL tomorrow.

  The live contract, from the Go handlers
  (HRMS_API/hr_ms_api/login/employeeHandler.go):

    GET    /employee        200 { "employees": [ … ] }   active employees only

    POST   /employee        201 { "message": "Employee created successfully." }
                            400 { "message": "Invalid Request" }
                            409 { "message": "Email already exists." }

    PUT    /employee/:id    200 { "message": "Employee updated successfully." }
                            400 { "message": "Invalid Request" }
                            404 { "message": "Employee not found." }
                            409 { "message": "Email already exists." }

    DELETE /employee/:id    200 { "message": "Employee deleted successfully." }
                            400 { "message": "Invalid employee id" }
                            404 { "message": "Employee not found." }
*/

const EMPLOYEES_ENDPOINT = '/employee'

/**
 * The employee as it travels on the wire — snake_case, exactly as Go's struct
 * tags emit it.
 *
 * Deliberately not exported. Its whole purpose is to be converted to
 * `Employee` on the way in and never seen again, and exporting it would let
 * `address_line_1` leak into a component.
 */
interface EmployeeWire {
  id: number
  first_name: string
  last_name: string
  email: string
  phone: string
  gender: string
  address_line_1: string
  address_line_2: string
  city: string
  state: string
  country: string
}

interface EmployeeListBody {
  /*
    Optional *and* nullable, which looks paranoid until you know Go: a nil
    slice marshals to `null`, not `[]`. The handler now initialises the slice
    so an empty table sends `[]`, but this type refuses to depend on that —
    one older build, or one other endpoint written the original way, and
    `.map()` on null crashes the page.
  */
  employees?: EmployeeWire[] | null
}

/**
 * GET /employee — the directory.
 *
 * Active employees only: the handler filters on `is_active = 1`, because
 * DELETE is a soft delete that flips that flag rather than removing the row.
 * A "deleted" colleague must not reappear here.
 */
export async function listEmployees(): Promise<Employee[]> {
  try {
    const response =
      await httpClient.get<EmployeeListBody>(EMPLOYEES_ENDPOINT)

    return (response.data.employees ?? []).map(toEmployee)
  } catch (caught) {
    throw toEmployeeError(caught)
  }
}

/** POST /employee — the server assigns the id, so nothing is returned. */
export async function createEmployee(input: NewEmployee): Promise<void> {
  try {
    await httpClient.post(EMPLOYEES_ENDPOINT, toCreateBody(input))
  } catch (caught) {
    throw toEmployeeError(caught)
  }
}

/**
 * PUT /employee/:id — a full replacement of the editable fields.
 *
 * Every field is sent on every save, including the ones the user did not
 * touch. That is what PUT means, and it matches the handler, whose UPDATE
 * statement sets all ten columns: sending a partial body would blank out
 * whatever was left out.
 */
export async function updateEmployee(
  id: number,
  input: EmployeeInput,
): Promise<void> {
  try {
    await httpClient.put(`${EMPLOYEES_ENDPOINT}/${id}`, toUpdateBody(input))
  } catch (caught) {
    throw toEmployeeError(caught)
  }
}

/**
 * DELETE /employee/:id — removes the employee from the directory.
 *
 * The handler implements this as a soft delete (`is_active = 0`), so the row
 * survives for payroll and attendance history and the person's sign-in stops
 * working. From this side of the wire that distinction does not matter: the
 * employee is gone from every list, and nothing in the UI can bring them back.
 * Treat it as destructive and confirm before calling it.
 */
export async function deleteEmployee(id: number): Promise<void> {
  try {
    await httpClient.delete(`${EMPLOYEES_ENDPOINT}/${id}`)
  } catch (caught) {
    throw toEmployeeError(caught)
  }
}

/*
  ─────────────────────────────────────────────────────────────────────────────
  Wire ⇄ domain
  ─────────────────────────────────────────────────────────────────────────────
*/

function toEmployee(wire: EmployeeWire): Employee {
  return {
    id: wire.id,
    firstName: wire.first_name ?? '',
    lastName: wire.last_name ?? '',
    email: wire.email,
    /*
      `?? ''` on every optional-ish string.

      The Go handler COALESCEs NULLs away, but a column added later, or a row
      written by some other tool, can still arrive as null — and `null.trim()`
      inside the search filter is a white screen, not a missing phone number.
      Normalising once, here, means no component downstream needs a null check.
    */
    phone: wire.phone ?? '',
    gender: wire.gender ?? '',
    addressLine1: wire.address_line_1 ?? '',
    addressLine2: wire.address_line_2 ?? '',
    city: wire.city ?? '',
    state: wire.state ?? '',
    country: wire.country ?? '',
  }
}

/** The ten editable columns, renamed for the wire. */
function toUpdateBody(input: EmployeeInput) {
  return {
    first_name: input.firstName,
    last_name: input.lastName,
    email: input.email,
    phone: input.phone,
    gender: input.gender,
    address_line_1: input.addressLine1,
    address_line_2: input.addressLine2,
    city: input.city,
    state: input.state,
    country: input.country,
  }
}

/** The same ten, plus the initial password that only a create accepts. */
function toCreateBody(input: NewEmployee) {
  return { ...toUpdateBody(input), password: input.password }
}

/*
  ─────────────────────────────────────────────────────────────────────────────
  Translating transport failures into domain failures
  ─────────────────────────────────────────────────────────────────────────────
  Below this line: status codes. Above it: messages a person can act on. No
  component should ever have to know that 409 is a number with a meaning.
*/
function toEmployeeError(caught: unknown): EmployeeError {
  if (isNetworkError(caught)) {
    return new EmployeeError(
      'network',
      'Could not reach the server. Check your connection and try again.',
      { cause: caught },
    )
  }

  switch (httpStatusOf(caught)) {
    case 409:
      /*
        The one server message worth showing almost verbatim. Unlike the login
        form — where naming the failed field would let a stranger discover who
        has an account — this list is behind a sign-in and already displays
        every address in it. Withholding "that email is taken" here would only
        leave the user guessing which field to fix.
      */
      return new EmployeeError(
        'duplicate_email',
        'An employee with that email address already exists.',
        { cause: caught },
      )

    case 404:
      return new EmployeeError(
        'not_found',
        'That employee no longer exists. Refresh the list to see the latest.',
        { cause: caught },
      )

    case 400:
      /*
        Our fault, not the user's: the server rejected a payload our own
        validation let through. The message says what to do next rather than
        pretending the user mistyped something.
      */
      return new EmployeeError(
        'invalid_request',
        'The server rejected those details. Please check the form and try again.',
        { cause: readApiMessage(caught) ?? caught },
      )

    default:
      return new EmployeeError(
        'server',
        'Something went wrong on our side. Please try again in a moment.',
        { cause: readApiMessage(caught) ?? caught },
      )
  }
}
