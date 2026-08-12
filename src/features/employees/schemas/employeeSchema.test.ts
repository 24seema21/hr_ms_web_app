import { describe, expect, it } from 'vitest'
import {
  createEmployeeSchema,
  editEmployeeSchema,
  genderOptionsFor,
  toEmployeeFormValues,
  toEmployeeInput,
} from './employeeSchema'
import type { EmployeeFormValues } from './employeeSchema'
import type { Employee } from '../types'

/*
  Pure unit tests: no rendering, no DOM, no network. The rules live in one
  place, so they can be checked in one place — and these run in milliseconds,
  which is what makes it reasonable to cover every branch.
*/

const VALID: EmployeeFormValues = {
  firstName: 'Asha',
  lastName: 'Rao',
  email: 'asha.rao@harkhr.com',
  password: 'Password123',
  phone: '9876543210',
  gender: 'Female',
  addressLine1: 'Flat 4B, Orchid Residency',
  addressLine2: '',
  city: 'Pune',
  state: 'Maharashtra',
  country: 'India',
}

/** The message for one field, or undefined if that field passed. */
function errorFor(
  values: Partial<EmployeeFormValues>,
  field: keyof EmployeeFormValues,
): string | undefined {
  const result = createEmployeeSchema.safeParse({ ...VALID, ...values })
  if (result.success) return undefined
  return result.error.issues.find((issue) => issue.path[0] === field)?.message
}

describe('createEmployeeSchema', () => {
  it('accepts a fully filled-in form', () => {
    expect(createEmployeeSchema.safeParse(VALID).success).toBe(true)
  })

  it('requires a first name', () => {
    expect(errorFor({ firstName: '' }, 'firstName')).toBe(
      'First name is required',
    )
  })

  it('reports a blank first name as missing rather than as too short', () => {
    // Checks run in order for a reason: "must be at least 2 characters" is a
    // baffling thing to say about a field the user has not touched.
    expect(errorFor({ firstName: '   ' }, 'firstName')).toBe(
      'First name is required',
    )
  })

  it('rejects a one-character first name', () => {
    expect(errorFor({ firstName: 'A' }, 'firstName')).toBe(
      'First name must be at least 2 characters',
    )
  })

  it('accepts an employee with no last name', () => {
    /*
      Mononymous people exist, and `last_name` is nullable. Demanding a surname
      means those employees cannot be entered truthfully — somebody types a dot
      to get past the form and the data is worse than if the field were blank.
    */
    expect(errorFor({ lastName: '' }, 'lastName')).toBeUndefined()
    expect(createEmployeeSchema.safeParse({ ...VALID, lastName: '' }).success).toBe(
      true,
    )
  })

  it('requires a valid email', () => {
    expect(errorFor({ email: '' }, 'email')).toBe('Email is required')
    expect(errorFor({ email: 'not-an-email' }, 'email')).toBe(
      'Enter a valid email address',
    )
  })

  it('trims whitespace off the values it returns', () => {
    const result = createEmployeeSchema.safeParse({
      ...VALID,
      firstName: '  Asha  ',
      email: '  asha.rao@harkhr.com  ',
    })

    /*
      The transformed value is what reaches the API, so a pasted address with a
      trailing space cannot become a duplicate record that only differs by
      invisible characters.
    */
    expect(result.success && result.data.firstName).toBe('Asha')
    expect(result.success && result.data.email).toBe('asha.rao@harkhr.com')
  })

  it('requires a password of at least 8 characters', () => {
    expect(errorFor({ password: '' }, 'password')).toBe('Password is required')
    expect(errorFor({ password: 'short' }, 'password')).toBe(
      'Password must be at least 8 characters',
    )
  })

  it('accepts phone numbers written in different styles', () => {
    for (const phone of ['9876543210', '919876543210', '020-2555123', '+919000']) {
      expect(errorFor({ phone }, 'phone')).toBeUndefined()
    }
  })

  it('rejects a phone number that could not be dialled', () => {
    expect(errorFor({ phone: 'call me' }, 'phone')).toMatch(/valid phone/i)
    // Too short to be a real number.
    expect(errorFor({ phone: '123' }, 'phone')).toMatch(/valid phone/i)
  })

  it('rejects a phone number longer than the varchar(12) column', () => {
    /*
      `+91 98765 43210` is 15 characters and does not fit. MySQL runs in strict
      mode, so the INSERT would be rejected outright and the API could only
      report a generic 500 — the user would see "something went wrong on our
      side" for what is really a too-long field.
    */
    expect(errorFor({ phone: '+91 98765 43210' }, 'phone')).toMatch(
      /12 characters/i,
    )
  })

  it('requires a gender to be chosen', () => {
    expect(errorFor({ gender: '' }, 'gender')).toBe('Select a gender')
  })

  it('treats address line 2 as the only optional field', () => {
    expect(errorFor({ addressLine2: '' }, 'addressLine2')).toBeUndefined()

    expect(errorFor({ addressLine1: '' }, 'addressLine1')).toBe(
      'Address line 1 is required',
    )
    expect(errorFor({ city: '' }, 'city')).toBe('City is required')
    expect(errorFor({ state: '' }, 'state')).toBe('State is required')
    expect(errorFor({ country: '' }, 'country')).toBe('Country is required')
  })
})

describe('editEmployeeSchema', () => {
  it('accepts an empty password', () => {
    /*
      The edit form never renders a password field and `updateEmployee()` never
      sends one — the API has no column for it in the UPDATE statement. If this
      test ever fails, editing an employee has started demanding a password
      that cannot be saved.
    */
    const result = editEmployeeSchema.safeParse({ ...VALID, password: '' })
    expect(result.success).toBe(true)
  })

  it('validates every other field exactly as creating does', () => {
    const result = editEmployeeSchema.safeParse({
      ...VALID,
      password: '',
      email: 'nope',
    })

    expect(result.success).toBe(false)
    expect(result.success === false && result.error.issues[0].message).toBe(
      'Enter a valid email address',
    )
  })
})

describe('toEmployeeInput', () => {
  it('drops the password', () => {
    const input = toEmployeeInput(VALID)

    // The API's update body has no password field. Building the object field
    // by field rather than spreading is what guarantees this.
    expect(input).not.toHaveProperty('password')
    expect(input.firstName).toBe('Asha')
    expect(input.lastName).toBe('Rao')
    expect(input.addressLine1).toBe('Flat 4B, Orchid Residency')
  })
})

describe('toEmployeeFormValues', () => {
  const EMPLOYEE: Employee = {
    id: 7,
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

  it('maps an employee onto the form, with a blank password', () => {
    expect(toEmployeeFormValues(EMPLOYEE)).toEqual({
      firstName: 'Rahul',
      lastName: 'Nair',
      email: 'rahul.nair@harkhr.com',
      password: '',
      phone: '919000011111',
      gender: 'Male',
      addressLine1: '12 MG Road',
      addressLine2: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
    })
  })

  it('never produces undefined, which would uncontrol an input', () => {
    for (const value of Object.values(toEmployeeFormValues(EMPLOYEE))) {
      expect(typeof value).toBe('string')
    }
  })
})

describe('genderOptionsFor', () => {
  it('offers the standard list when the record matches it', () => {
    expect(genderOptionsFor('Female')).toEqual(['Male', 'Female', 'Other'])
  })

  it('offers the standard list when there is no value yet', () => {
    expect(genderOptionsFor('')).toEqual(['Male', 'Female', 'Other'])
  })

  it('keeps a stored value the dropdown does not offer', () => {
    /*
      The database column is free text, so a row written before this list
      existed can hold anything. Without this, opening the edit form would show
      a blank select and saving would silently overwrite the record — a
      dropdown must never change data just by being displayed.
    */
    expect(genderOptionsFor('male')).toEqual(['Male', 'Female', 'Other', 'male'])
    expect(genderOptionsFor('Non-binary')).toContain('Non-binary')
  })
})
