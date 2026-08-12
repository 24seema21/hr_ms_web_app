import { Badge } from '@/shared/components/ui/Badge'
import { IconButton } from '@/shared/components/ui/IconButton'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  SortIcon,
  TrashIcon,
} from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import { fullNameOf, initialsOf } from '../lib/employeeName'
import { locationOf } from '../lib/employeeFilters'
import type { SortKey, SortState } from '../lib/employeeFilters'
import type { Employee } from '../types'

interface EmployeeTableProps {
  employees: Employee[]
  sort: SortState
  onSort: (key: SortKey) => void
  /** Opens the detail panel. The row's name is the control that calls it. */
  onView: (employee: Employee) => void
  onEdit: (employee: Employee) => void
  onDelete: (employee: Employee) => void
}

/** `null` for a column that is not sortable — Phone, Actions. */
const COLUMNS: readonly {
  id: string
  label: string
  sortKey: SortKey | null
  className?: string
}[] = [
  { id: 'employee', label: 'Employee', sortKey: 'name' },
  { id: 'phone', label: 'Phone', sortKey: null },
  { id: 'gender', label: 'Gender', sortKey: 'gender' },
  { id: 'location', label: 'Location', sortKey: 'location' },
  { id: 'actions', label: 'Actions', sortKey: null, className: 'text-right' },
]

/**
 * The directory itself.
 *
 * A real `<table>`, not a grid of divs. Tabular data in a table gives a screen
 * reader "row 4 of 12, Phone, +91 98…" for free; the same layout built from
 * divs reads as an undifferentiated stream of text, and no amount of ARIA
 * bolted on afterwards is as reliable as the element that already means this.
 *
 * Presentational on purpose: it receives rows, a sort state and four
 * callbacks, and owns none of them. Everything about *when* an edit or a
 * delete happens belongs to the page, which is what makes this component
 * trivial to test and reuse.
 */
export function EmployeeTable({
  employees,
  sort,
  onSort,
  onView,
  onEdit,
  onDelete,
}: EmployeeTableProps) {
  return (
    /*
      The horizontal scroll lives on this wrapper, not on the page.

      Five columns do not fit a phone, and the alternative to scrolling one
      element is the entire layout scrolling sideways — which drags the header
      and the buttons off screen with it.
    */
    <div className="overflow-x-auto">
      <table className="w-full min-w-[52rem] border-collapse text-left text-sm">
        {/*
          A caption is the table's accessible name. `sr-only` hides it from
          sight — the page already has a visible "Employees" heading — while
          keeping it in the accessibility tree, so a screen reader announces
          what the table is before reading its contents.
        */}
        <caption className="sr-only">
          Employee directory, {employees.length}{' '}
          {employees.length === 1 ? 'person' : 'people'}, sorted by {sort.key}{' '}
          {sort.direction === 'asc' ? 'ascending' : 'descending'}
        </caption>

        <thead className="border-b border-ink-200 bg-ink-50/70">
          <tr>
            {COLUMNS.map((column) => {
              /*
                Pulled into a `const` before the checks below, not read as
                `column.sortKey` inside them. TypeScript narrows a property
                access only until the next function boundary, so the click
                handler — a closure — would still see `SortKey | null` and
                refuse to compile. A local const narrows once and stays narrow.
              */
              const { sortKey } = column
              const isSorted = sortKey !== null && sort.key === sortKey

              return (
                /*
                  `scope="col"` links each header to its column, which is how a
                  screen reader can say "Phone" before reading a cell three rows
                  down. It costs one attribute and it is the single
                  highest-value thing you can add to a table.

                  `aria-sort` is the other half: it is how the *current* sort is
                  announced. Note that nothing is added to the visible text to
                  say so — the arrow is `aria-hidden` and the state lives in the
                  attribute, because a header whose accessible name changes to
                  "Employee sorted ascending" is a moving target for anything
                  looking the column up by name.
                */
                <th
                  key={column.id}
                  scope="col"
                  aria-sort={
                    isSorted
                      ? sort.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : undefined
                  }
                  className={cn(
                    'type-label px-4 py-3 whitespace-nowrap text-ink-500',
                    column.className,
                  )}
                >
                  {sortKey === null ? (
                    column.label
                  ) : (
                    <button
                      type="button"
                      onClick={() => onSort(sortKey)}
                      className={cn(
                        // `uppercase` is repeated from the `type-label` on the
                        // <th> because buttons do not inherit `text-transform`
                        // — without it the sortable headers read "Employee"
                        // while the fixed ones read "PHONE".
                        'inline-flex cursor-pointer items-center gap-1.5 rounded uppercase transition-colors hover:text-ink-900',
                        isSorted && 'text-ink-900',
                      )}
                    >
                      {column.label}
                      {/*
                        Three states, not two: sorted up, sorted down, and
                        "sortable, but not the current sort". Without the third
                        icon nothing tells the user that Gender can be sorted
                        at all until they happen to click it.
                      */}
                      {isSorted ? (
                        sort.direction === 'asc' ? (
                          <ArrowUpIcon className="h-3.5 w-3.5 text-brand-600" />
                        ) : (
                          <ArrowDownIcon className="h-3.5 w-3.5 text-brand-600" />
                        )
                      ) : (
                        <SortIcon className="h-3.5 w-3.5 text-ink-300" />
                      )}
                    </button>
                  )}
                </th>
              )
            })}
          </tr>
        </thead>

        <tbody className="divide-y divide-ink-100">
          {employees.map((employee) => {
            /*
              Computed once per row rather than four times inline. The name is
              needed for the visible cell and for three button labels, and
              calling it once is also what guarantees the label a screen reader
              announces matches the text a sighted user sees.
            */
            const fullName = fullNameOf(employee)

            return (
              /*
                Keyed by the database id, never the array index.

                With an index key, deleting the second of five rows makes React
                reuse row 2's DOM node for what used to be row 3 — so any state
                inside a row (a focused button, an open menu) sticks to the
                wrong person. A stable id tells React the truth about what
                moved. It matters twice as much here, where sorting reorders
                every row on a single click.
              */
              <tr key={employee.id} className="group transition-colors hover:bg-brand-50/40">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span
                      className="type-label flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-brand-50 text-brand-700"
                      // Decorative: the name is right next to it in real text.
                      aria-hidden="true"
                    >
                      {initialsOf(employee)}
                    </span>

                    <div className="min-w-0">
                      {/*
                        The name is a button, because the record has eleven
                        fields and the table shows five: this is how the other
                        six are read without opening the edit form and putting
                        the user one keystroke away from changing data they
                        only wanted to look at.

                        A whole-row click handler would be the other option and
                        a worse one — it swallows text selection, it cannot be
                        reached by keyboard, and it fires when someone means to
                        press Delete.
                      */}
                      <button
                        type="button"
                        onClick={() => onView(employee)}
                        aria-label={`View ${fullName}`}
                        className="cursor-pointer truncate rounded font-medium text-ink-900 transition-colors hover:text-brand-700 hover:underline hover:underline-offset-2"
                      >
                        {fullName}
                      </button>
                      <p className="truncate text-xs text-ink-500">
                        {employee.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink-700">
                  {employee.phone || <Unset />}
                </td>

                <td className="px-4 py-3 whitespace-nowrap">
                  {employee.gender ? (
                    <Badge>{employee.gender}</Badge>
                  ) : (
                    <Unset />
                  )}
                </td>

                <td className="px-4 py-3 text-ink-700">
                  {locationOf(employee) || <Unset />}
                </td>

                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-1">
                    {/*
                      The accessible name includes the employee's name.

                      Twelve buttons all called "Edit" are useless to anyone
                      navigating by a list of controls — they hear "Edit, Edit,
                      Edit". `IconButton` requires a label for exactly this
                      reason, and the row's name is what makes each one
                      distinct.

                      Always visible, never revealed on hover: hover-only row
                      actions do not exist on a touch screen and cannot be
                      found by anyone who navigates with a keyboard.
                    */}
                    <IconButton
                      label={`Edit ${fullName}`}
                      icon={<PencilIcon className="h-4.5 w-4.5" />}
                      tone="brand"
                      size="sm"
                      onClick={() => onEdit(employee)}
                    />
                    <IconButton
                      label={`Delete ${fullName}`}
                      icon={<TrashIcon className="h-4.5 w-4.5" />}
                      tone="danger"
                      size="sm"
                      onClick={() => onDelete(employee)}
                    />
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

/**
 * A visible stand-in for a blank field.
 *
 * An empty cell is ambiguous — is the data missing, or did the page fail to
 * render it? A dash says "we looked, there is nothing here". `aria-hidden`
 * keeps the screen reader from announcing a literal dash for every gap.
 */
function Unset() {
  return (
    <span className="text-ink-300" aria-hidden="true">
      —
    </span>
  )
}
