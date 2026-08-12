import { IconButton } from './IconButton'
import { SelectField } from './SelectField'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

/*
  Not exported. `react-refresh/only-export-components` fails a component file
  that also exports a value — and rightly: Vite can only hot-swap a module
  whose every export is a component, so one exported constant costs the whole
  file its fast refresh.
*/
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const

interface PaginationProps {
  /** 1-based, because that is what the label says out loud. */
  page: number
  pageCount: number
  pageSize: number
  /** Rows after filtering — the number the range is counted against. */
  filteredCount: number
  /** Rows before filtering. Shown only when the two differ. */
  totalCount: number
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

/**
 * The bar under a table: how much you are looking at, and how to move.
 *
 * Paging is client-side here because `GET /employee` returns the whole
 * directory in one response — there is no `?page=` to call. That is fine for
 * the low thousands and wrong above it; the day the directory outgrows one
 * response, this component's props are already the shape a server-paged
 * version needs, and only the hook behind it changes.
 */
export function Pagination({
  page,
  pageCount,
  pageSize,
  filteredCount,
  totalCount,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  /*
    The range, computed rather than tracked. `Math.min` on the end matters for
    the last page, which is almost always short — without it the bar cheerfully
    claims "showing 41–50 of 43".
  */
  const firstRow = filteredCount === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, filteredCount)

  const isFiltered = filteredCount !== totalCount

  return (
    <div className="flex flex-col gap-3 border-t border-ink-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      {/*
        `aria-live="polite"` because filtering and paging both change this text
        without moving focus. A sighted user sees the count update; without the
        live region, a screen-reader user types into the search box and hears
        nothing at all.

        Deliberately not `role="status"`: the toast owns that role in this
        product, and two polite live regions competing to announce different
        things at the same moment is how both get missed.
      */}
      <p aria-live="polite" className="text-sm text-ink-600">
        Showing{' '}
        <span className="font-medium text-ink-900">
          {firstRow}–{lastRow}
        </span>{' '}
        of <span className="font-medium text-ink-900">{filteredCount}</span>
        {isFiltered && (
          <span className="text-ink-500"> (filtered from {totalCount})</span>
        )}
      </p>

      <div className="flex items-center gap-4">
        <SelectField
          label="Rows per page"
          hideLabel
          fieldSize="sm"
          className="w-auto"
          value={pageSize}
          onChange={(event) => onPageSizeChange(Number(event.target.value))}
        >
          {PAGE_SIZE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </SelectField>

        <div className="flex items-center gap-1">
          <IconButton
            label="Previous page"
            icon={<ChevronLeftIcon className="h-5 w-5" />}
            // Disabled rather than hidden: a control that disappears at the
            // edges makes the row jump sideways every time you reach one.
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          />

          <p className="min-w-24 text-center text-sm text-ink-600">
            Page <span className="font-medium text-ink-900">{page}</span> of{' '}
            {pageCount}
          </p>

          <IconButton
            label="Next page"
            icon={<ChevronRightIcon className="h-5 w-5" />}
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      </div>
    </div>
  )
}
