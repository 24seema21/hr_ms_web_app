import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { UserEvent } from '@testing-library/user-event'
import { EmployeeError } from '../types'
import type { Employee } from '../types'
import { EmployeesPage } from './EmployeesPage'

/*
  The API module is the seam.

  Everything above it is real — the hook, the search filter, the dialogs, the
  form, Zod validation, the wire-format mapping in `toEmployeeInput`. What the
  test controls is only what the server would have said. Mocking `httpClient`
  instead would work too, but it would make every assertion about *payloads*
  read in snake_case, and the point of these tests is the behaviour a user sees.
*/
vi.mock('@/features/employees/api/employeeApi', () => ({
  listEmployees: vi.fn(),
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  deleteEmployee: vi.fn(),
}))

import * as employeeApi from '../api/employeeApi'

const listEmployees = vi.mocked(employeeApi.listEmployees)
const createEmployee = vi.mocked(employeeApi.createEmployee)
const updateEmployee = vi.mocked(employeeApi.updateEmployee)
const deleteEmployee = vi.mocked(employeeApi.deleteEmployee)

const ASHA: Employee = {
  id: 1,
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

const RAHUL: Employee = {
  id: 2,
  firstName: 'Rahul',
  lastName: 'Nair',
  email: 'rahul.nair@harkhr.com',
  phone: '919000011111',
  gender: 'Male',
  addressLine1: '12 MG Road',
  addressLine2: '',
  city: 'Bengaluru',
  state: 'Karnataka',
  country: 'India',
}

/** Renders the page and waits for the first fetch to settle. */
async function renderPage() {
  render(<EmployeesPage />)
  await screen.findByRole('heading', { name: 'Employees', level: 1 })
}

/** The open dialog, which lives in a portal on <body>. */
function openDialog() {
  return screen.getByRole('dialog')
}

/**
 * Types a complete, valid employee into the open form.
 *
 * Fields are found by their *label*, exactly as a person finds them. If the
 * htmlFor/id wiring in TextField or SelectField ever breaks, these lines fail —
 * so the helper doubles as an accessibility check on every form field.
 */
async function fillForm(
  user: UserEvent,
  overrides: Partial<Record<string, string>> = {},
) {
  const dialog = openDialog()
  const values = {
    firstName: 'Priya',
    lastName: 'Menon',
    email: 'priya.menon@harkhr.com',
    password: 'Password123',
    phone: '9123456789',
    gender: 'Female',
    addressLine1: '9 Residency Road',
    city: 'Kochi',
    state: 'Kerala',
    country: 'India',
    ...overrides,
  }

  const type = async (label: RegExp, value: string) => {
    const field = within(dialog).getByLabelText(label)
    await user.clear(field)
    if (value !== '') await user.type(field, value)
  }

  await type(/first name/i, values.firstName)
  await type(/last name/i, values.lastName)
  await type(/work email/i, values.email)

  // Only present when creating — the edit form has no password field at all.
  const password = within(dialog).queryByLabelText(/temporary password/i)
  if (password) {
    await user.clear(password)
    if (values.password !== '') await user.type(password, values.password)
  }

  await type(/phone/i, values.phone)
  await user.selectOptions(
    within(dialog).getByLabelText(/gender/i),
    values.gender,
  )
  await type(/address line 1/i, values.addressLine1)
  await type(/city/i, values.city)
  await type(/state/i, values.state)
  await type(/country/i, values.country)
}

beforeEach(() => {
  vi.clearAllMocks()
  listEmployees.mockResolvedValue([ASHA, RAHUL])
  createEmployee.mockResolvedValue(undefined)
  updateEmployee.mockResolvedValue(undefined)
  deleteEmployee.mockResolvedValue(undefined)
})

describe('EmployeesPage — reading', () => {
  it('loads the directory on mount and renders a row per employee', async () => {
    await renderPage()

    expect(await screen.findByText('Asha Rao')).toBeInTheDocument()
    expect(screen.getByText('Rahul Nair')).toBeInTheDocument()
    expect(listEmployees).toHaveBeenCalledTimes(1)
  })

  it('renders the directory as a real table with column headers', async () => {
    await renderPage()
    await screen.findByText('Asha Rao')

    /*
      Queried by role: a screen reader only announces "row 2 of 3, Phone…" if
      this is a genuine <table> with <th scope="col"> headers. A grid of divs
      would render identically and fail here — which is the point.
    */
    const table = screen.getByRole('table')
    expect(
      within(table).getByRole('columnheader', { name: 'Employee' }),
    ).toBeInTheDocument()
    expect(within(table).getAllByRole('row')).toHaveLength(3) // header + 2
  })

  it('shows a distinct empty state when nobody has been added yet', async () => {
    listEmployees.mockResolvedValue([])
    await renderPage()

    expect(await screen.findByText('No employees yet')).toBeInTheDocument()
    // No table at all — an empty grid with headers reads as "loading forever".
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })

  it('reports a failed load and can retry it', async () => {
    const user = userEvent.setup()
    listEmployees.mockRejectedValueOnce(
      new EmployeeError(
        'network',
        'Could not reach the server. Check your connection and try again.',
      ),
    )
    await renderPage()

    /*
      `getByRole('alert')` rather than matching text: it asserts the failure is
      announced to a screen reader, which is the part that is easy to break and
      impossible to notice by eye.
    */
    expect(await screen.findByRole('alert')).toHaveTextContent(
      /could not reach the server/i,
    )

    // The most common cause in development is the Go server not being up yet,
    // so retrying must not require reloading the whole page.
    listEmployees.mockResolvedValue([ASHA])
    await user.click(screen.getByRole('button', { name: /try again/i }))

    expect(await screen.findByText('Asha Rao')).toBeInTheDocument()
  })
})

describe('EmployeesPage — searching', () => {
  it('filters the visible rows as the user types', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.type(screen.getByLabelText(/search/i), 'bengaluru')

    // Matches on city, not just name — searching a directory by location is
    // the second thing anybody tries.
    expect(screen.getByText('Rahul Nair')).toBeInTheDocument()
    expect(screen.queryByText('Asha Rao')).not.toBeInTheDocument()
    // No second request: the whole directory is already here.
    expect(listEmployees).toHaveBeenCalledTimes(1)
  })

  it('distinguishes "no matches" from "no employees"', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.type(screen.getByLabelText(/search/i), 'zzzz')

    /*
      Telling someone their directory is empty when their search is simply too
      narrow is how people conclude their data has been deleted.
    */
    expect(screen.getByText(/no employees match/i)).toBeInTheDocument()
    expect(screen.queryByText('No employees yet')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /clear search/i }))
    expect(screen.getByText('Asha Rao')).toBeInTheDocument()
  })
})

describe('EmployeesPage — creating', () => {
  it('will not submit an empty form, and says why per field', async () => {
    const user = userEvent.setup()
    await renderPage()

    await user.click(screen.getByRole('button', { name: /add employee/i }))
    await user.click(
      within(openDialog()).getByRole('button', { name: /create employee/i }),
    )

    expect(await screen.findByText('First name is required')).toBeInTheDocument()
    expect(screen.getByText('Email is required')).toBeInTheDocument()
    expect(screen.getByText('Password is required')).toBeInTheDocument()
    // Nothing was sent, and the dialog stayed open so the user can fix it.
    expect(createEmployee).not.toHaveBeenCalled()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('sends the typed values, reloads the list and confirms what happened', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: /add employee/i }))
    await fillForm(user)
    await user.click(
      within(openDialog()).getByRole('button', { name: /create employee/i }),
    )

    await waitFor(() => {
      expect(createEmployee).toHaveBeenCalledWith({
        firstName: 'Priya',
        lastName: 'Menon',
        email: 'priya.menon@harkhr.com',
        password: 'Password123',
        phone: '9123456789',
        gender: 'Female',
        addressLine1: '9 Residency Road',
        addressLine2: '',
        city: 'Kochi',
        state: 'Kerala',
        country: 'India',
      })
    })

    // The dialog closes only on success…
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })

    /*
      …the list is re-fetched rather than patched locally, because the server
      assigns the id and is the only authority on what the directory now
      contains…
    */
    expect(listEmployees).toHaveBeenCalledTimes(2)

    // …and the outcome is announced, not just implied by a row appearing.
    expect(await screen.findByRole('status')).toHaveTextContent(
      /priya menon was added/i,
    )
  })

  it('puts a rejected duplicate email on the email field, keeping the rest typed', async () => {
    const user = userEvent.setup()
    createEmployee.mockRejectedValue(
      new EmployeeError(
        'duplicate_email',
        'An employee with that email address already exists.',
      ),
    )
    await renderPage()

    await user.click(screen.getByRole('button', { name: /add employee/i }))
    await fillForm(user, { email: 'asha.rao@harkhr.com' })
    await user.click(
      within(openDialog()).getByRole('button', { name: /create employee/i }),
    )

    /*
      The message belongs under the input the user has to change. A banner at
      the top saying "something is wrong" leaves them hunting through ten
      fields for it.
    */
    expect(
      await screen.findByText(/already exists/i),
    ).toBeInTheDocument()

    const dialog = openDialog()
    // Retyping ten fields because of one rejected email is a hostile touch.
    expect(within(dialog).getByLabelText(/first name/i)).toHaveValue('Priya')
    expect(within(dialog).getByLabelText(/city/i)).toHaveValue('Kochi')
  })

  it('reports an unreachable server in the form instead of closing', async () => {
    const user = userEvent.setup()
    createEmployee.mockRejectedValue(
      new EmployeeError(
        'network',
        'Could not reach the server. Check your connection and try again.',
      ),
    )
    await renderPage()

    await user.click(screen.getByRole('button', { name: /add employee/i }))
    await fillForm(user)
    await user.click(
      within(openDialog()).getByRole('button', { name: /create employee/i }),
    )

    expect(
      await within(openDialog()).findByRole('alert'),
    ).toHaveTextContent(/could not reach the server/i)
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('EmployeesPage — editing', () => {
  it('opens pre-filled with that employee and no password field', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    /*
      Found by an accessible name that includes the person. Twelve buttons all
      called "Edit" are useless to anyone navigating by a list of controls —
      and this test would be ambiguous, which is the same problem showing up
      early.
    */
    await user.click(screen.getByRole('button', { name: 'Edit Asha Rao' }))

    const dialog = openDialog()
    expect(within(dialog).getByLabelText(/first name/i)).toHaveValue('Asha')
    expect(within(dialog).getByLabelText(/last name/i)).toHaveValue('Rao')
    expect(within(dialog).getByLabelText(/work email/i)).toHaveValue(
      'asha.rao@harkhr.com',
    )
    expect(within(dialog).getByLabelText(/city/i)).toHaveValue('Pune')

    /*
      Not a disabled password field — no field at all. `PUT /employee/:id` has
      no password column in its UPDATE statement, and a control that cannot do
      anything is worse than no control.
    */
    expect(
      within(dialog).queryByLabelText(/password/i),
    ).not.toBeInTheDocument()
  })

  it('saves changes against that employee id, without a password', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: 'Edit Asha Rao' }))

    const lastNameField = within(openDialog()).getByLabelText(/last name/i)
    await user.clear(lastNameField)
    await user.type(lastNameField, 'Rao-Kulkarni')

    await user.click(
      within(openDialog()).getByRole('button', { name: /save changes/i }),
    )

    await waitFor(() => {
      expect(updateEmployee).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          firstName: 'Asha',
          lastName: 'Rao-Kulkarni',
          email: 'asha.rao@harkhr.com',
          city: 'Pune',
        }),
      )
    })

    // The id is the only stable identifier; sending the email instead would
    // break the moment somebody edits their own address.
    expect(updateEmployee.mock.calls[0][1]).not.toHaveProperty('password')
    expect(listEmployees).toHaveBeenCalledTimes(2)
  })

  it('keeps a gender value the dropdown does not normally offer', async () => {
    const user = userEvent.setup()
    listEmployees.mockResolvedValue([{ ...ASHA, gender: 'Non-binary' }])
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: 'Edit Asha Rao' }))

    /*
      The column is free text, so a row can hold anything. If the select
      snapped to the blank placeholder here, saving the form would silently
      rewrite the record — a dropdown must never change data just by being
      displayed.
    */
    expect(within(openDialog()).getByLabelText(/gender/i)).toHaveValue(
      'Non-binary',
    )
  })
})

describe('EmployeesPage — deleting', () => {
  it('asks first, and names the person it is about to remove', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: 'Delete Rahul Nair' }))

    const dialog = openDialog()
    // "Are you sure?" on its own is the dialog everybody clicks through.
    expect(dialog).toHaveTextContent(/rahul nair/i)
    expect(dialog).toHaveTextContent(/cannot be undone/i)
    expect(deleteEmployee).not.toHaveBeenCalled()
  })

  it('does nothing at all when the confirmation is cancelled', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: 'Delete Rahul Nair' }))
    await user.click(
      within(openDialog()).getByRole('button', { name: /cancel/i }),
    )

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
    expect(deleteEmployee).not.toHaveBeenCalled()
    expect(screen.getByText('Rahul Nair')).toBeInTheDocument()
  })

  it('deletes by id, reloads and confirms once the user agrees', async () => {
    const user = userEvent.setup()
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: 'Delete Rahul Nair' }))
    listEmployees.mockResolvedValue([ASHA])
    await user.click(
      within(openDialog()).getByRole('button', { name: /delete employee/i }),
    )

    await waitFor(() => {
      expect(deleteEmployee).toHaveBeenCalledWith(2)
    })
    expect(await screen.findByRole('status')).toHaveTextContent(
      /rahul nair was removed/i,
    )
    await waitFor(() => {
      expect(screen.queryByText('Rahul Nair')).not.toBeInTheDocument()
    })
  })

  it('stays open and explains itself when the delete fails', async () => {
    const user = userEvent.setup()
    deleteEmployee.mockRejectedValue(
      new EmployeeError(
        'not_found',
        'That employee no longer exists. Refresh the list to see the latest.',
      ),
    )
    await renderPage()
    await screen.findByText('Asha Rao')

    await user.click(screen.getByRole('button', { name: 'Delete Rahul Nair' }))
    await user.click(
      within(openDialog()).getByRole('button', { name: /delete employee/i }),
    )

    /*
      Closing on failure would leave the user looking at a list that still
      shows the employee, with no idea whether the delete landed.
    */
    expect(await within(openDialog()).findByRole('alert')).toHaveTextContent(
      /no longer exists/i,
    )
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })
})

describe('EmployeesPage — dialog behaviour', () => {
  it('gives the dialog an accessible name', async () => {
    const user = userEvent.setup()
    await renderPage()

    await user.click(screen.getByRole('button', { name: /add employee/i }))

    // Without aria-labelledby a screen reader announces "dialog" and nothing
    // else, leaving the user to guess what just opened.
    expect(screen.getByRole('dialog', { name: /add employee/i })).toBeInTheDocument()
  })

  it('closes on Escape', async () => {
    const user = userEvent.setup()
    await renderPage()

    await user.click(screen.getByRole('button', { name: /add employee/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    await user.keyboard('{Escape}')

    // The native <dialog> element would give this for free; jsdom does not
    // implement showModal(), so Modal implements it by hand — and this is the
    // test that keeps it honest.
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    })
  })

  it('moves focus into the dialog when it opens', async () => {
    const user = userEvent.setup()
    await renderPage()

    await user.click(screen.getByRole('button', { name: /add employee/i }))

    // Focus left behind the dialog means a keyboard user tabs through the page
    // underneath, wondering why nothing responds.
    expect(openDialog().contains(document.activeElement)).toBe(true)
  })
})
