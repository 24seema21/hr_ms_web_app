import { useCallback, useMemo, useState } from 'react'
import {
  NO_FILTERS,
  distinctValuesOf,
  filterEmployees,
  hasActiveFilters,
  pageCountOf,
  paginate,
  sortEmployees,
} from '../lib/employeeFilters'
import type {
  EmployeeFilters,
  SortKey,
  SortState,
} from '../lib/employeeFilters'
import type { Employee } from '../types'

const DEFAULT_PAGE_SIZE = 10
const DEFAULT_SORT: SortState = { key: 'name', direction: 'asc' }

export interface UseEmployeeTableResult {
  /** The rows to render: filtered, sorted, and cut down to the current page. */
  rows: Employee[]
  filters: EmployeeFilters
  sort: SortState
  page: number
  pageSize: number
  pageCount: number
  /** How many rows survived the filters, across all pages. */
  filteredCount: number
  isFiltered: boolean
  /** Filter dropdown options, derived from the data currently loaded. */
  cityOptions: string[]
  genderOptions: string[]
  setQuery: (query: string) => void
  setCity: (city: string) => void
  setGender: (gender: string) => void
  clearFilters: () => void
  /** Sorts by this column, or flips the direction if it is already the one. */
  toggleSort: (key: SortKey) => void
  setPage: (page: number) => void
  setPageSize: (pageSize: number) => void
}

/**
 * Everything about *how the directory is being looked at* — search, filters,
 * sort, page — separated from *what the directory contains*, which is
 * `useEmployees`.
 *
 * The split matters. This state survives a reload of the data (delete someone
 * and your search, sort and page are all still where you left them), it never
 * touches the network, and it is the half a future server-side implementation
 * would replace wholesale while the page component stays as it is.
 *
 * Every derivation runs through `useMemo` in a deliberate order — filter, then
 * sort, then page — so typing one character re-filters, but changing pages
 * re-slices without re-filtering or re-sorting anything.
 */
export function useEmployeeTable(employees: Employee[]): UseEmployeeTableResult {
  const [filters, setFilters] = useState<EmployeeFilters>(NO_FILTERS)
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)

  const filtered = useMemo(
    () => filterEmployees(employees, filters),
    [employees, filters],
  )

  const sorted = useMemo(() => sortEmployees(filtered, sort), [filtered, sort])

  const pageCount = pageCountOf(sorted.length, pageSize)

  /*
    The current page, clamped rather than corrected.

    Deleting the last row of page 4 leaves `page` pointing past the end. The
    obvious fix is an effect that notices and calls `setPage` — which renders
    an empty table for one frame first, and adds a state update that can loop
    if the condition is ever written slightly wrong. Clamping at the point of
    use has neither problem: the render is correct immediately, and `page`
    catches up the next time the user touches it.
  */
  const safePage = Math.min(page, pageCount)

  const rows = useMemo(
    () => paginate(sorted, safePage, pageSize),
    [sorted, safePage, pageSize],
  )

  /*
    Dropdown options come from the *whole* directory, not from the filtered
    rows. Deriving them from what is currently visible means picking "Pune"
    removes every other city from the list — so the only way back is to clear
    the filter you just set.
  */
  const cityOptions = useMemo(
    () => distinctValuesOf(employees, 'city'),
    [employees],
  )
  const genderOptions = useMemo(
    () => distinctValuesOf(employees, 'gender'),
    [employees],
  )

  /*
    Every filter change resets to page 1.

    Without it, filtering from 60 rows down to 3 while sitting on page 5 shows
    an empty table, and the user concludes the search found nothing.
  */
  const updateFilters = useCallback((patch: Partial<EmployeeFilters>) => {
    setFilters((current) => ({ ...current, ...patch }))
    setPage(1)
  }, [])

  const setQuery = useCallback(
    (query: string) => updateFilters({ query }),
    [updateFilters],
  )
  const setCity = useCallback(
    (city: string) => updateFilters({ city }),
    [updateFilters],
  )
  const setGender = useCallback(
    (gender: string) => updateFilters({ gender }),
    [updateFilters],
  )

  const clearFilters = useCallback(() => {
    setFilters(NO_FILTERS)
    setPage(1)
  }, [])

  const toggleSort = useCallback((key: SortKey) => {
    setSort((current) =>
      current.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : /* A new column always starts ascending. Inheriting the previous
             column's direction means clicking "Email" can silently give you a
             Z-to-A list you never asked for. */
          { key, direction: 'asc' },
    )
    setPage(1)
  }, [])

  const changePageSize = useCallback((nextSize: number) => {
    setPageSize(nextSize)
    // Row 45 is on a different page once the page holds 100 rows, so there is
    // no honest way to "stay where you were". Going back to the top is the
    // predictable answer.
    setPage(1)
  }, [])

  return {
    rows,
    filters,
    sort,
    page: safePage,
    pageSize,
    pageCount,
    filteredCount: sorted.length,
    isFiltered: hasActiveFilters(filters),
    cityOptions,
    genderOptions,
    setQuery,
    setCity,
    setGender,
    clearFilters,
    toggleSort,
    setPage,
    setPageSize: changePageSize,
  }
}
