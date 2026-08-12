import { useEffect, useRef } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { IconButton } from '@/shared/components/ui/IconButton'
import { SelectField } from '@/shared/components/ui/SelectField'
import { Spinner } from '@/shared/components/ui/Spinner'
import { TextField } from '@/shared/components/ui/TextField'
import { CloseIcon, RefreshIcon, SearchIcon } from '@/shared/components/ui/icons'
import type { EmployeeFilters } from '../lib/employeeFilters'

interface EmployeeToolbarProps {
  filters: EmployeeFilters
  cityOptions: string[]
  genderOptions: string[]
  isFiltered: boolean
  isRefreshing: boolean
  onQueryChange: (query: string) => void
  onCityChange: (city: string) => void
  onGenderChange: (gender: string) => void
  onClearFilters: () => void
  onRefresh: () => void
}

/**
 * The controls above the table: find, narrow, refresh.
 *
 * Presentational — it owns no filter state, it reports changes upward. That is
 * what lets the same three values drive the table, the result count, the empty
 * state's wording and (one day) a URL query string, without four components
 * each keeping their own idea of what is being searched for.
 */
export function EmployeeToolbar({
  filters,
  cityOptions,
  genderOptions,
  isFiltered,
  isRefreshing,
  onQueryChange,
  onCityChange,
  onGenderChange,
  onClearFilters,
  onRefresh,
}: EmployeeToolbarProps) {
  const searchRef = useRef<HTMLInputElement>(null)

  /*
    "/" focuses the search box — the shortcut every tool this audience already
    uses has trained them to try.

    The guards are the whole job: not while they are typing into some other
    field (or the slash never appears in the text they are writing), not while
    a dialog is open (the dialog traps focus for a reason), and not when a
    modifier is held (Cmd+/ belongs to the browser).
  */
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      const target = event.target as HTMLElement | null
      if (target?.closest('input, textarea, select, [contenteditable="true"]')) {
        return
      }
      if (document.querySelector('[role="dialog"]')) return

      event.preventDefault()
      searchRef.current?.focus()
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  const hasQuery = filters.query !== ''

  return (
    <div className="flex flex-col gap-3 border-b border-ink-200 p-4 lg:flex-row lg:items-center">
      <TextField
        label="Search"
        // The magnifier and the placeholder already say what this is; the
        // label stays in the accessibility tree, just not on screen.
        hideLabel
        type="search"
        fieldSize="sm"
        placeholder="Search name, email, phone or city"
        className="lg:max-w-sm lg:flex-1"
        ref={searchRef}
        value={filters.query}
        onChange={(event) => onQueryChange(event.target.value)}
        leadingIcon={<SearchIcon className="h-4 w-4" />}
        trailing={
          hasQuery ? (
            <IconButton
              label="Clear search"
              icon={<CloseIcon className="h-4 w-4" />}
              size="sm"
              onClick={() => {
                onQueryChange('')
                // Focus goes back where the user was working, not to <body>.
                searchRef.current?.focus()
              }}
            />
          ) : (
            /*
              The shortcut, advertised where it is used. `aria-hidden` because
              a screen-reader user navigating by keyboard already has better
              ways in, and "forward slash" read out mid-field is noise.
            */
            <kbd
              aria-hidden="true"
              className="mr-1.5 hidden rounded border border-ink-200 bg-ink-50 px-1.5 py-0.5 font-mono text-[0.625rem] text-ink-400 sm:block"
            >
              /
            </kbd>
          )
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <SelectField
          label="City"
          hideLabel
          fieldSize="sm"
          value={filters.city}
          onChange={(event) => onCityChange(event.target.value)}
        >
          {/* "Any city" rather than a blank first option: a select showing
              nothing looks like a value that failed to load. */}
          <option value="">Any city</option>
          {cityOptions.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Gender"
          hideLabel
          fieldSize="sm"
          value={filters.gender}
          onChange={(event) => onGenderChange(event.target.value)}
        >
          <option value="">Any gender</option>
          {genderOptions.map((gender) => (
            <option key={gender} value={gender}>
              {gender}
            </option>
          ))}
        </SelectField>

        {/* Appears only when there is something to clear — a permanently
            visible "Clear" is a button that does nothing most of the time. */}
        {isFiltered && (
          <Button variant="ghost" size="sm" onClick={onClearFilters}>
            Clear filters
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 lg:ml-auto">
        {/*
          The refresh indicator sits next to the button rather than replacing
          the table. Swapping the list for a spinner on every reload makes the
          page flash and loses the user's place — the data on screen is still
          valid until the new data arrives.
        */}
        {isRefreshing && (
          <span className="flex items-center gap-2 text-sm text-ink-500">
            <Spinner className="text-ink-400" />
            Refreshing…
          </span>
        )}

        <IconButton
          label="Refresh directory"
          icon={<RefreshIcon className="h-5 w-5" />}
          onClick={onRefresh}
          disabled={isRefreshing}
        />
      </div>
    </div>
  )
}
