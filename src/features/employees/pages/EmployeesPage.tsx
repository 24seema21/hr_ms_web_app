import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { EmptyState } from '@/shared/components/ui/EmptyState'
import { Pagination } from '@/shared/components/ui/Pagination'
import { Skeleton } from '@/shared/components/ui/Skeleton'
import { Toast } from '@/shared/components/ui/Toast'
import { AlertIcon, PlusIcon, SearchIcon, UsersIcon } from '@/shared/components/ui/icons'
import * as employeeApi from '../api/employeeApi'
import { fullNameOf } from '../lib/employeeName'
import { useEmployees } from '../hooks/useEmployees'
import { useEmployeeTable } from '../hooks/useEmployeeTable'
import { EmployeeToolbar } from '../components/EmployeeToolbar'
import { EmployeeTable } from '../components/EmployeeTable'
import { EmployeeDetailDrawer } from '../components/EmployeeDetailDrawer'
import { EmployeeFormModal } from '../components/EmployeeFormModal'
import { DeleteEmployeeModal } from '../components/DeleteEmployeeModal'
import { toEmployeeInput } from '../schemas/employeeSchema'
import type { EmployeeFormValues } from '../schemas/employeeSchema'
import type { Employee } from '../types'

/*
  Which overlay is open, as one value instead of four booleans.

  `isCreateOpen`, `isEditOpen`, `isDeleteOpen`, `isDetailOpen` plus a
  `selectedEmployee` can represent states that must never happen — two dialogs
  open at once, or an edit dialog with nobody selected — and every one of those
  is a bug waiting to be written. A discriminated union makes them
  unrepresentable: `null` means nothing is open, and the `kind` tells
  TypeScript that `employee` is present.
*/
type Dialog =
  | { kind: 'create' }
  | { kind: 'view'; employee: Employee }
  | { kind: 'edit'; employee: Employee }
  | { kind: 'delete'; employee: Employee }

/**
 * Confirmation of the last completed action.
 *
 * The `id` exists so that doing the same thing twice — deleting two people,
 * saving the same record again — re-announces it. Keyed on the message alone,
 * React would see an identical element and leave the first toast's dismissal
 * timer running, so the second confirmation would vanish early or not appear
 * at all.
 */
interface Notice {
  id: number
  message: string
}

/**
 * The employee directory: list, search, filter, sort, page, create, edit,
 * delete.
 *
 * The page is the orchestrator, and deliberately owns only what is *happening*
 * — which overlay is open, and what the last action achieved. Everything else
 * is delegated: fetching to `useEmployees`, the view state to
 * `useEmployeeTable`, rendering to the table and toolbar, collecting input to
 * the dialogs.
 */
export function EmployeesPage() {
  const { employees, status, error, isRefreshing, reload } = useEmployees()
  const table = useEmployeeTable(employees)

  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [notice, setNotice] = useState<Notice | null>(null)

  const announce = (message: string) =>
    setNotice({ id: Date.now(), message })

  const openCreate = () => {
    setNotice(null)
    setDialog({ kind: 'create' })
  }

  const handleSave = async (values: EmployeeFormValues) => {
    /*
      Deliberately not wrapped in try/catch. A rejection has to reach
      EmployeeFormModal, which is what decides whether the message belongs on
      the email field or in the form-level banner — and which keeps the dialog
      open so the typed values survive. Swallowing it here would close the
      dialog on failure and lose the lot.
    */
    const savedName = fullNameOf(values)

    if (dialog?.kind === 'edit') {
      await employeeApi.updateEmployee(
        dialog.employee.id,
        toEmployeeInput(values),
      )
      announce(`${savedName}'s details were updated.`)
    } else {
      await employeeApi.createEmployee({
        ...toEmployeeInput(values),
        password: values.password,
      })
      announce(`${savedName} was added to the directory.`)
    }

    /*
      Re-fetch rather than patching the local array.

      The server assigns the id and could normalise or reject anything else, so
      the response to "what does the directory look like now?" is the
      directory, not our guess at it. It also picks up a colleague's changes
      for free. `reload()` never rejects — it reports its own failures — so a
      refresh problem cannot be mistaken for a save problem.
    */
    await reload()
  }

  const handleDelete = async (employee: Employee) => {
    await employeeApi.deleteEmployee(employee.id)
    announce(`${fullNameOf(employee)} was removed from the directory.`)
    await reload()
  }

  const isReady = status === 'ready'
  const isEmpty = isReady && employees.length === 0
  const hasNoMatches = isReady && employees.length > 0 && table.filteredCount === 0

  return (
    <div className="mx-auto w-full max-w-[92rem] px-4 py-8 sm:px-6 lg:px-8">
      {/* ── Page header ────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="type-label text-brand-600">People</p>
          <h1 className="type-wide mt-1.5 text-2xl font-bold tracking-tight text-ink-900">
            Employees
          </h1>
          {/*
            "active" is not filler. The API lists only employees with
            is_active = 1, because deleting is a deactivation — so this count
            can be lower than the row count in the database, and saying so
            stops that looking like missing data.
          */}
          <p className="mt-1.5 text-sm text-ink-600">
            {isReady
              ? `${employees.length} active ${employees.length === 1 ? 'person' : 'people'} in your organisation`
              : 'The people in your organisation'}
          </p>
        </div>

        <Button onClick={openCreate}>
          <PlusIcon className="h-4 w-4" />
          Add employee
        </Button>
      </div>

      {/* ── The directory ──────────────────────────────────────────────── */}
      <div className="mt-6 overflow-hidden rounded-card border border-ink-200 bg-surface shadow-card">
        {/*
          The toolbar stays mounted through every state below it — including
          the error and the empty states. Taking the search box away the moment
          a filter matches nothing means the only way to widen the search is to
          reload the page.

          It is hidden only while the very first load is in flight, when there
          is genuinely nothing to filter yet.
        */}
        {status !== 'loading' && (
          <EmployeeToolbar
            filters={table.filters}
            cityOptions={table.cityOptions}
            genderOptions={table.genderOptions}
            isFiltered={table.isFiltered}
            isRefreshing={isRefreshing}
            onQueryChange={table.setQuery}
            onCityChange={table.setCity}
            onGenderChange={table.setGender}
            onClearFilters={table.clearFilters}
            onRefresh={() => void reload()}
          />
        )}

        {status === 'loading' ? (
          <TableSkeleton />
        ) : status === 'error' ? (
          /*
            `role="alert"` so the failure is announced, not just displayed.
            This is the one state a screen-reader user would otherwise have no
            way of knowing about: the table simply never arrives.
          */
          <div role="alert" className="px-6 py-16 text-center">
            <span
              className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-card bg-danger-50 text-danger-600"
              aria-hidden="true"
            >
              <AlertIcon className="h-6 w-6" />
            </span>
            <h2 className="type-wide text-base font-semibold text-danger-700">
              Could not load the directory
            </h2>
            <p className="mx-auto mt-2 max-w-prose text-sm text-danger-700">
              {error}
            </p>
            {/*
              A retry button, because the most common cause in development is
              the Go server not running yet — and reloading the whole page to
              try again is a heavy way to ask a question twice.
            */}
            <Button
              variant="secondary"
              className="mt-6"
              isLoading={isRefreshing}
              onClick={() => void reload()}
            >
              Try again
            </Button>
          </div>
        ) : isEmpty ? (
          <EmptyState
            variant="dashed"
            className="m-4 border-0 bg-transparent"
            icon={<UsersIcon className="h-6 w-6" />}
            title="No employees yet"
            description="Add the first person to your directory and they will appear here, ready for attendance and payroll."
            action={
              <Button onClick={openCreate}>
                <PlusIcon className="h-4 w-4" />
                Add employee
              </Button>
            }
          />
        ) : hasNoMatches ? (
          /*
            A distinct state from "no employees yet", and the distinction
            matters: one means "your directory is empty", the other means "your
            search is too narrow". Showing the first when the second is true
            has people convinced their data is gone.
          */
          <EmptyState
            className="m-4 border-0"
            icon={<SearchIcon className="h-6 w-6" />}
            title="Nothing matches those filters"
            description={
              table.filters.query.trim() !== ''
                ? `No employees match “${table.filters.query}”. Try a different name, email, phone number or city.`
                : 'No employees match the selected filters.'
            }
            action={
              <Button variant="secondary" onClick={table.clearFilters}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <EmployeeTable
              employees={table.rows}
              sort={table.sort}
              onSort={table.toggleSort}
              onView={(employee) => setDialog({ kind: 'view', employee })}
              onEdit={(employee) => {
                setNotice(null)
                setDialog({ kind: 'edit', employee })
              }}
              onDelete={(employee) => {
                setNotice(null)
                setDialog({ kind: 'delete', employee })
              }}
            />

            <Pagination
              page={table.page}
              pageCount={table.pageCount}
              pageSize={table.pageSize}
              filteredCount={table.filteredCount}
              totalCount={employees.length}
              onPageChange={table.setPage}
              onPageSizeChange={table.setPageSize}
            />
          </>
        )}
      </div>

      {/*
        The overlays are *mounted* when open and unmounted when closed, rather
        than rendered permanently with an `isOpen` prop. Each opening therefore
        starts from clean form state — no leftover values from the last
        employee, no reset effect to remember.
      */}
      {dialog?.kind === 'view' && (
        <EmployeeDetailDrawer
          employee={dialog.employee}
          onClose={() => setDialog(null)}
          // Read → change is a deliberate second step, and it swaps one
          // overlay for the other rather than stacking two.
          onEdit={() => setDialog({ kind: 'edit', employee: dialog.employee })}
          onDelete={() =>
            setDialog({ kind: 'delete', employee: dialog.employee })
          }
        />
      )}

      {(dialog?.kind === 'create' || dialog?.kind === 'edit') && (
        <EmployeeFormModal
          employee={dialog.kind === 'edit' ? dialog.employee : null}
          onClose={() => setDialog(null)}
          onSave={handleSave}
        />
      )}

      {dialog?.kind === 'delete' && (
        <DeleteEmployeeModal
          employee={dialog.employee}
          onClose={() => setDialog(null)}
          onConfirm={() => handleDelete(dialog.employee)}
        />
      )}

      {notice && (
        <Toast
          // Keyed by id so a repeated action re-announces instead of reusing
          // the previous toast (and its half-expired timer).
          key={notice.id}
          message={notice.message}
          onDismiss={() => setNotice(null)}
        />
      )}
    </div>
  )
}

/**
 * The table's shape, before the table exists.
 *
 * Deliberately not a `<table>`: a skeleton is decoration, and a screen reader
 * finding an empty grid with five column headers would announce a table that
 * is not there. One polite "Loading employees" is the whole of what assistive
 * tech needs here.
 */
function TableSkeleton() {
  return (
    <div className="p-4" aria-busy="true">
      <span className="sr-only" role="status">
        Loading employees…
      </span>

      <div className="flex items-center gap-3">
        <Skeleton className="h-10 flex-1 max-w-sm" />
        <Skeleton className="ml-auto h-10 w-28" />
      </div>

      <div className="mt-6 space-y-4">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-4">
            <Skeleton className="h-9 w-9 rounded-control" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="hidden h-4 w-28 sm:block" />
            <Skeleton className="hidden h-4 w-40 md:block" />
            <Skeleton className="ml-auto h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  )
}
