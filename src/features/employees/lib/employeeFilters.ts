import { fullNameOf, searchableFieldsOf } from './employeeName'
import type { Employee } from '../types'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE TABLE'S BRAIN, AS PURE FUNCTIONS
  ─────────────────────────────────────────────────────────────────────────────
  Searching, filtering, sorting and paging are the parts of a data grid that
  are easy to get subtly wrong — an off-by-one in the page range, a sort that
  puts blank cities first, a filter that is case-sensitive on Tuesdays. Every
  one of them lives here as a plain function of its inputs.

  Nothing in this file imports React. That is what lets the whole set be tested
  in milliseconds without rendering anything (see employeeFilters.test.ts), and
  it keeps `useEmployeeTable` down to the part that is genuinely about state.
*/

export const SORT_KEYS = ['name', 'email', 'gender', 'location'] as const
export type SortKey = (typeof SORT_KEYS)[number]
export type SortDirection = 'asc' | 'desc'

export interface SortState {
  key: SortKey
  direction: SortDirection
}

export interface EmployeeFilters {
  /** Free text, matched across the fields in `searchableFieldsOf`. */
  query: string
  /** Exact city match, or '' for "any". */
  city: string
  /** Exact gender match, or '' for "any". */
  gender: string
}

export const NO_FILTERS: EmployeeFilters = { query: '', city: '', gender: '' }

/** `Pune, Maharashtra, India`, skipping whichever parts are blank. */
export function locationOf(employee: Employee): string {
  return [employee.city, employee.state, employee.country]
    .map((part) => part.trim())
    .filter(Boolean)
    .join(', ')
}

/** True when anything is narrowing the list — drives the "clear" affordance. */
export function hasActiveFilters(filters: EmployeeFilters): boolean {
  return (
    filters.query.trim() !== '' || filters.city !== '' || filters.gender !== ''
  )
}

/**
 * Case-insensitive substring match across the fields somebody would actually
 * search by, plus the two exact-match dropdowns.
 *
 * Filtering happens in the browser because the API returns the whole directory
 * in one response — there is no `?search=` parameter to call, and
 * round-tripping to the server on every keystroke would be slower and worse.
 */
export function filterEmployees(
  employees: Employee[],
  filters: EmployeeFilters,
): Employee[] {
  const needle = filters.query.trim().toLowerCase()

  return employees.filter((employee) => {
    if (filters.city !== '' && employee.city !== filters.city) return false
    if (filters.gender !== '' && employee.gender !== filters.gender) return false
    if (needle === '') return true

    return searchableFieldsOf(employee).some((field) =>
      field.toLowerCase().includes(needle),
    )
  })
}

/** The value a given column sorts on. Kept next to the sort so they cannot drift. */
function sortValueOf(employee: Employee, key: SortKey): string {
  switch (key) {
    case 'name':
      return fullNameOf(employee)
    case 'email':
      return employee.email
    case 'gender':
      return employee.gender
    case 'location':
      return locationOf(employee)
  }
}

export function sortEmployees(
  employees: Employee[],
  { key, direction }: SortState,
): Employee[] {
  /*
    A copy, because `Array.prototype.sort` mutates. Sorting the array that came
    from the hook's state in place is the classic React bug where the UI does
    not update — the reference never changed, so nothing re-rendered — and the
    original order is destroyed either way.
  */
  return [...employees].sort((a, b) => {
    const left = sortValueOf(a, key).trim()
    const right = sortValueOf(b, key).trim()

    /*
      Blanks always sink, in both directions.

      A record with no city is missing information, not a city that comes
      before "Ahmedabad". Sorting them to the top of an ascending list buries
      the data the user asked to see under a block of dashes.
    */
    if (left === '' && right !== '') return 1
    if (right === '' && left !== '') return -1

    /*
      `localeCompare` rather than `<`, which compares UTF-16 code units: that
      puts every capital letter before every lowercase one ("Zoya" before
      "asha") and mis-sorts every accented name in the directory.
    */
    const comparison = left.localeCompare(right, undefined, {
      sensitivity: 'base',
      numeric: true,
    })

    return direction === 'asc' ? comparison : -comparison
  })
}

/** The 1-based page count, never zero — an empty table is still "page 1 of 1". */
export function pageCountOf(rowCount: number, pageSize: number): number {
  return Math.max(1, Math.ceil(rowCount / pageSize))
}

/** The rows on a 1-based page. Out-of-range pages come back empty, not thrown. */
export function paginate<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize
  return rows.slice(start, start + pageSize)
}

/**
 * The distinct values of one field, for a filter dropdown.
 *
 * Built from the data rather than from a hard-coded list, so a new city
 * appears in the filter the moment somebody is hired there. Blanks are
 * dropped: "filter by nothing" is what the "Any" option already means.
 */
export function distinctValuesOf(
  employees: Employee[],
  field: 'city' | 'gender',
): string[] {
  const values = new Set<string>()

  for (const employee of employees) {
    const value = employee[field].trim()
    if (value !== '') values.add(value)
  }

  return [...values].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
}
