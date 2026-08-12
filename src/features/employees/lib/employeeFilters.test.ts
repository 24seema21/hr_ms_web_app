import { describe, expect, it } from 'vitest'
import {
  distinctValuesOf,
  filterEmployees,
  hasActiveFilters,
  locationOf,
  pageCountOf,
  paginate,
  sortEmployees,
} from './employeeFilters'
import type { EmployeeFilters } from './employeeFilters'
import type { Employee } from '../types'

/*
  These are the parts of the data grid that are pure functions of their inputs,
  so they are tested as pure functions — no rendering, no user events, no
  waiting. Every case below is one that produced a real bug in a real table at
  some point: blanks sorting to the top, a case-sensitive search, a page range
  that runs off the end of the array.
*/

function employee(overrides: Partial<Employee> = {}): Employee {
  return {
    id: 1,
    firstName: 'Asha',
    lastName: 'Rao',
    email: 'asha.rao@harkhr.com',
    phone: '9876543210',
    gender: 'Female',
    addressLine1: 'Flat 4B',
    addressLine2: '',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    ...overrides,
  }
}

const NONE: EmployeeFilters = { query: '', city: '', gender: '' }

describe('filterEmployees', () => {
  const asha = employee()
  const rahul = employee({
    id: 2,
    firstName: 'Rahul',
    lastName: 'Nair',
    email: 'rahul.nair@harkhr.com',
    gender: 'Male',
    city: 'Bengaluru',
    state: 'Karnataka',
  })

  it('returns everything when nothing is set', () => {
    expect(filterEmployees([asha, rahul], NONE)).toEqual([asha, rahul])
  })

  it('matches across name, email and city, ignoring case', () => {
    expect(filterEmployees([asha, rahul], { ...NONE, query: 'BENGALURU' })).toEqual([rahul])
    expect(filterEmployees([asha, rahul], { ...NONE, query: 'asha rao' })).toEqual([asha])
    expect(filterEmployees([asha, rahul], { ...NONE, query: '.nair@' })).toEqual([rahul])
  })

  it('ignores surrounding whitespace in the query', () => {
    // Otherwise a trailing space from a paste or a phone keyboard silently
    // empties the table.
    expect(filterEmployees([asha, rahul], { ...NONE, query: '  pune  ' })).toEqual([asha])
  })

  it('combines the dropdowns with the search as AND, not OR', () => {
    expect(
      filterEmployees([asha, rahul], { query: 'a', city: 'Pune', gender: 'Female' }),
    ).toEqual([asha])
    expect(
      filterEmployees([asha, rahul], { query: 'a', city: 'Pune', gender: 'Male' }),
    ).toEqual([])
  })
})

describe('sortEmployees', () => {
  it('sorts by full name in both directions', () => {
    const zoya = employee({ id: 3, firstName: 'Zoya', lastName: 'Khan' })
    const asha = employee({ id: 1, firstName: 'Asha', lastName: 'Rao' })

    expect(
      sortEmployees([zoya, asha], { key: 'name', direction: 'asc' }).map((e) => e.id),
    ).toEqual([1, 3])
    expect(
      sortEmployees([zoya, asha], { key: 'name', direction: 'desc' }).map((e) => e.id),
    ).toEqual([3, 1])
  })

  it('is case-insensitive, so lowercase names are not exiled to the end', () => {
    // The bug this prevents: a raw `<` comparison sorts every capital letter
    // before every lowercase one, so "Zoya" lands above "asha".
    const lower = employee({ id: 2, firstName: 'asha', lastName: '' })
    const upper = employee({ id: 3, firstName: 'Zoya', lastName: '' })

    expect(
      sortEmployees([upper, lower], { key: 'name', direction: 'asc' }).map((e) => e.id),
    ).toEqual([2, 3])
  })

  it('keeps blank values last in both directions', () => {
    const withCity = employee({ id: 1, city: 'Pune' })
    const withoutCity = employee({ id: 2, city: '', state: '', country: '' })

    expect(
      sortEmployees([withoutCity, withCity], { key: 'location', direction: 'asc' })
        .map((e) => e.id),
    ).toEqual([1, 2])
    // Still last descending: a missing city is missing information, not a
    // value that sorts before "Ahmedabad" or after "Vadodara".
    expect(
      sortEmployees([withoutCity, withCity], { key: 'location', direction: 'desc' })
        .map((e) => e.id),
    ).toEqual([1, 2])
  })

  it('does not mutate the array it was given', () => {
    // Sorting state in place is the classic "the UI did not update" bug: the
    // array reference never changed, so React never re-rendered.
    const input = [employee({ id: 2, firstName: 'Zoya' }), employee({ id: 1, firstName: 'Asha' })]
    sortEmployees(input, { key: 'name', direction: 'asc' })

    expect(input.map((e) => e.id)).toEqual([2, 1])
  })
})

describe('paginate', () => {
  const rows = [1, 2, 3, 4, 5]

  it('slices the requested 1-based page', () => {
    expect(paginate(rows, 1, 2)).toEqual([1, 2])
    expect(paginate(rows, 3, 2)).toEqual([5])
  })

  it('returns nothing for a page past the end instead of throwing', () => {
    // Reachable by deleting the last row of the last page, and a crash there
    // would take the whole table with it.
    expect(paginate(rows, 9, 2)).toEqual([])
  })
})

describe('pageCountOf', () => {
  it('rounds up, and never reports zero pages', () => {
    expect(pageCountOf(0, 10)).toBe(1)
    expect(pageCountOf(10, 10)).toBe(1)
    expect(pageCountOf(11, 10)).toBe(2)
  })
})

describe('distinctValuesOf', () => {
  it('deduplicates, sorts and drops blanks', () => {
    const people = [
      employee({ id: 1, city: 'Pune' }),
      employee({ id: 2, city: 'Bengaluru' }),
      employee({ id: 3, city: 'Pune' }),
      employee({ id: 4, city: '  ' }),
    ]

    expect(distinctValuesOf(people, 'city')).toEqual(['Bengaluru', 'Pune'])
  })
})

describe('locationOf', () => {
  it('joins the parts that are present', () => {
    expect(locationOf(employee())).toBe('Pune, Maharashtra, India')
    expect(locationOf(employee({ state: '' }))).toBe('Pune, India')
    expect(locationOf(employee({ city: '', state: '', country: '' }))).toBe('')
  })
})

describe('hasActiveFilters', () => {
  it('treats a whitespace-only query as no filter at all', () => {
    expect(hasActiveFilters(NONE)).toBe(false)
    expect(hasActiveFilters({ ...NONE, query: '   ' })).toBe(false)
    expect(hasActiveFilters({ ...NONE, query: 'asha' })).toBe(true)
    expect(hasActiveFilters({ ...NONE, city: 'Pune' })).toBe(true)
  })
})
