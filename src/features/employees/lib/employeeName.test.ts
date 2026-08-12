import { describe, expect, it } from 'vitest'
import { fullNameOf, initialsOf, searchableFieldsOf } from './employeeName'
import type { Employee } from '../types'

const EMPLOYEE: Employee = {
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

describe('fullNameOf', () => {
  it('joins the two columns', () => {
    expect(fullNameOf(EMPLOYEE)).toBe('Asha Rao')
  })

  it('leaves no trailing space when there is no last name', () => {
    /*
      The whole reason `lastName` is optional. A trailing space is invisible in
      a table cell and very visible in `aria-label="Delete Ravi "` and in
      "Ravi  was removed from the directory."
    */
    expect(fullNameOf({ firstName: 'Ravi', lastName: '' })).toBe('Ravi')
    expect(fullNameOf({ firstName: 'Ravi', lastName: '   ' })).toBe('Ravi')
  })
})

describe('initialsOf', () => {
  it('takes one letter from each name', () => {
    expect(initialsOf(EMPLOYEE)).toBe('AR')
  })

  it('uses the first and last name, not the first and last word', () => {
    /*
      Built from the two fields rather than by splitting a joined string:
      splitting "Amelia Van Der Berg" on spaces would give `AB`, taking the
      initial of a middle particle as if it were her surname.
    */
    expect(initialsOf({ firstName: 'Amelia', lastName: 'Van Der Berg' })).toBe(
      'AV',
    )
  })

  it('copes with a single name', () => {
    expect(initialsOf({ firstName: 'Ravi', lastName: '' })).toBe('R')
  })

  it('renders a placeholder rather than an empty circle', () => {
    // An empty avatar looks like a rendering bug; a "?" looks like missing data.
    expect(initialsOf({ firstName: '', lastName: '' })).toBe('?')
  })
})

describe('searchableFieldsOf', () => {
  it('includes the joined name so a full-name search works', () => {
    // "asha rao" spans two columns; without the joined form, searching the way
    // people actually type a name would find nothing.
    expect(searchableFieldsOf(EMPLOYEE)).toContain('Asha Rao')
  })

  it('leaves out address lines', () => {
    // Matching on a street would mean typing "road" returns half the company.
    const fields = searchableFieldsOf(EMPLOYEE)
    expect(fields).not.toContain('Baner Road')
    expect(fields).not.toContain('Flat 4B, Orchid Residency')
  })
})
