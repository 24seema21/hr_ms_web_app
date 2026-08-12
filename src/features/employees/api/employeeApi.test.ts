import { beforeEach, describe, expect, it, vi } from 'vitest'
import { httpNetworkError, httpResponseError } from '@/test/httpErrors'
import { EmployeeError } from '../types'

/*
  The transport is mocked, not the API layer.

  What `employeeApi` actually does is translate — snake_case to camelCase on
  the way in, status codes to error codes on the way out — so the seam to
  control is `httpClient`. Mocking `employeeApi` itself would leave every line
  under test unexecuted.

  `importOriginal` keeps `httpStatusOf`, `isNetworkError` and `readApiMessage`
  real, because the module imports those too and they are part of the logic
  being tested.
*/
vi.mock('@/shared/lib/httpClient', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/shared/lib/httpClient')>()
  return {
    ...actual,
    httpClient: {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    },
  }
})

import { httpClient } from '@/shared/lib/httpClient'
import {
  createEmployee,
  deleteEmployee,
  listEmployees,
  updateEmployee,
} from './employeeApi'

const get = vi.mocked(httpClient.get)
const post = vi.mocked(httpClient.post)
const put = vi.mocked(httpClient.put)
const del = vi.mocked(httpClient.delete)

/** One row exactly as the Go handler emits it. */
const WIRE_EMPLOYEE = {
  id: 3,
  first_name: 'Asha',
  last_name: 'Rao',
  email: 'asha.rao@harkhr.com',
  phone: '9876543210',
  gender: 'Female',
  address_line_1: 'Flat 4B, Orchid Residency',
  address_line_2: 'Baner Road',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
}

const EMPLOYEE_INPUT = {
  firstName: 'Asha',
  lastName: 'Rao',
  email: 'asha.rao@harkhr.com',
  phone: '9876543210',
  gender: 'Female',
  addressLine1: 'Flat 4B, Orchid Residency',
  addressLine2: 'Baner Road',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
}

/** Runs `call`, expecting it to reject, and hands back the EmployeeError. */
async function failureFrom(call: () => Promise<unknown>): Promise<EmployeeError> {
  try {
    await call()
  } catch (caught) {
    if (caught instanceof EmployeeError) return caught
    throw caught
  }
  throw new Error('Expected the call to reject, but it resolved.')
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('listEmployees', () => {
  it('requests the employee endpoint', async () => {
    get.mockResolvedValue({ data: { employees: [] } })

    await listEmployees()

    expect(get).toHaveBeenCalledWith('/employee')
  })

  it('renames the wire fields to camelCase', async () => {
    get.mockResolvedValue({ data: { employees: [WIRE_EMPLOYEE] } })

    const [employee] = await listEmployees()

    /*
      The boundary's whole job. If this breaks, `address_line_1` starts leaking
      into components — and the fix then costs one edit per component instead
      of one edit here.
    */
    expect(employee).toEqual({
      id: 3,
      firstName: 'Asha',
      lastName: 'Rao',
      email: 'asha.rao@harkhr.com',
      phone: '9876543210',
      gender: 'Female',
      addressLine1: 'Flat 4B, Orchid Residency',
      addressLine2: 'Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
    })
  })

  it('returns an empty array when the server sends null', async () => {
    /*
      Go marshals a nil slice to `null`, not `[]`. The handler now initialises
      the slice, but this guard is what keeps one older build of the backend
      from turning the whole page into "cannot read properties of null".
    */
    get.mockResolvedValue({ data: { employees: null } })

    await expect(listEmployees()).resolves.toEqual([])
  })

  it('returns an empty array when the key is missing entirely', async () => {
    get.mockResolvedValue({ data: {} })

    await expect(listEmployees()).resolves.toEqual([])
  })

  it('turns a null column into an empty string', async () => {
    get.mockResolvedValue({
      data: {
        employees: [
          { ...WIRE_EMPLOYEE, phone: null, city: null, last_name: null },
        ],
      },
    })

    const [employee] = await listEmployees()

    /*
      Every one of these columns is `DEFAULT NULL` in the schema. A missing
      phone number must render as blank, not crash the search filter the first
      time somebody types into it — `null.toLowerCase()` is a white screen.
    */
    expect(employee.phone).toBe('')
    expect(employee.city).toBe('')
    expect(employee.lastName).toBe('')
  })

  it('maps an unreachable server to a network EmployeeError', async () => {
    get.mockRejectedValue(httpNetworkError())

    const error = await failureFrom(listEmployees)

    expect(error.code).toBe('network')
    expect(error.message).toMatch(/could not reach the server/i)
  })

  it('maps a 500 to a server EmployeeError without echoing its wording', async () => {
    get.mockRejectedValue(
      httpResponseError(500, { message: 'Failed to fetch employee list' }),
    )

    const error = await failureFrom(listEmployees)

    expect(error.code).toBe('server')
    // Server text is written for a developer; it belongs on `cause`.
    expect(error.message).not.toMatch(/failed to fetch/i)
    expect(error.cause).toBeDefined()
  })
})

describe('createEmployee', () => {
  it('posts the fields in the shape the Go handler expects', async () => {
    post.mockResolvedValue({ data: { message: 'Employee created successfully.' } })

    await createEmployee({ ...EMPLOYEE_INPUT, password: 'Password123' })

    expect(post).toHaveBeenCalledWith('/employee', {
      first_name: 'Asha',
      last_name: 'Rao',
      email: 'asha.rao@harkhr.com',
      phone: '9876543210',
      gender: 'Female',
      address_line_1: 'Flat 4B, Orchid Residency',
      address_line_2: 'Baner Road',
      city: 'Pune',
      state: 'Maharashtra',
      country: 'India',
      password: 'Password123',
    })
  })

  it('maps a 409 to duplicate_email', async () => {
    post.mockRejectedValue(
      httpResponseError(409, { message: 'Email already exists.' }),
    )

    const error = await failureFrom(() =>
      createEmployee({ ...EMPLOYEE_INPUT, password: 'Password123' }),
    )

    // The form uses this code to put the message on the email field rather
    // than in a banner that leaves the user hunting for the problem.
    expect(error.code).toBe('duplicate_email')
    expect(error.message).toMatch(/already exists/i)
  })

  it('maps a 400 to invalid_request', async () => {
    post.mockRejectedValue(httpResponseError(400, { message: 'Invalid Request' }))

    const error = await failureFrom(() =>
      createEmployee({ ...EMPLOYEE_INPUT, password: 'Password123' }),
    )

    // Our bug, not the user's: our validation let through something the
    // server refused.
    expect(error.code).toBe('invalid_request')
  })
})

describe('updateEmployee', () => {
  it('puts to the id-scoped URL', async () => {
    put.mockResolvedValue({ data: { message: 'Employee updated successfully.' } })

    await updateEmployee(3, EMPLOYEE_INPUT)

    expect(put).toHaveBeenCalledWith('/employee/3', expect.any(Object))
  })

  it('never sends a password', async () => {
    put.mockResolvedValue({ data: { message: 'Employee updated successfully.' } })

    await updateEmployee(3, EMPLOYEE_INPUT)

    /*
      The UPDATE statement in the Go handler does not touch `password_hash`,
      and the request type has no field for one. This test is what stops a
      future refactor from reintroducing it and blanking out a login.
    */
    expect(put.mock.calls[0][1]).not.toHaveProperty('password')
  })

  it('sends every editable field, not just the changed ones', async () => {
    put.mockResolvedValue({ data: { message: 'Employee updated successfully.' } })

    await updateEmployee(3, EMPLOYEE_INPUT)

    // PUT replaces: the handler sets all ten columns, so omitting one would
    // blank it in the database.
    expect(Object.keys(put.mock.calls[0][1] as object)).toHaveLength(10)
  })

  it('splits the name into the two columns the table actually has', () => {
    // Guarded by a type-level check as well — `EmployeeInput` has no `name`
    // field — but this pins the wire names the Go struct tags declare.
    expect(Object.keys(EMPLOYEE_INPUT)).toContain('firstName')
    expect(Object.keys(EMPLOYEE_INPUT)).not.toContain('name')
  })

  it('maps a 404 to not_found', async () => {
    put.mockRejectedValue(
      httpResponseError(404, { message: 'Employee not found.' }),
    )

    const error = await failureFrom(() => updateEmployee(3, EMPLOYEE_INPUT))

    // Somebody else deleted the row. Retrying will not help; reloading will.
    expect(error.code).toBe('not_found')
    expect(error.message).toMatch(/refresh/i)
  })

  it('maps a 409 to duplicate_email', async () => {
    put.mockRejectedValue(
      httpResponseError(409, { message: 'Email already exists.' }),
    )

    const error = await failureFrom(() => updateEmployee(3, EMPLOYEE_INPUT))

    expect(error.code).toBe('duplicate_email')
  })
})

describe('deleteEmployee', () => {
  it('deletes the id-scoped URL', async () => {
    del.mockResolvedValue({ data: { message: 'Employee deleted successfully.' } })

    await deleteEmployee(3)

    expect(del).toHaveBeenCalledWith('/employee/3')
  })

  it('maps a 404 to not_found', async () => {
    del.mockRejectedValue(
      httpResponseError(404, { message: 'Employee not found.' }),
    )

    const error = await failureFrom(() => deleteEmployee(3))

    expect(error.code).toBe('not_found')
  })
})
