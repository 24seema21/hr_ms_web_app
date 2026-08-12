import { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import { Modal } from '@/shared/components/ui/Modal'
import { AlertIcon } from '@/shared/components/ui/icons'
import { fullNameOf } from '../lib/employeeName'
import { EmployeeError } from '../types'
import type { Employee } from '../types'

interface DeleteEmployeeModalProps {
  employee: Employee
  onClose: () => void
  /** Performs the delete. Resolves on success, rejects on failure. */
  onConfirm: () => Promise<void>
}

/**
 * The confirmation step in front of an irreversible action.
 *
 * `window.confirm()` would be four lines instead of forty, and it is the wrong
 * tool: it cannot say *which* employee is about to go, it cannot show the
 * error when the request fails, it blocks the whole page, and it looks like a
 * browser warning rather than part of the product. The cost of getting a
 * destructive action wrong is a row nobody can get back.
 */
export function DeleteEmployeeModal({
  employee,
  onClose,
  onConfirm,
}: DeleteEmployeeModalProps) {
  /*
    Local state, not lifted to the page.

    Whether this dialog is mid-request and what its error says are of no
    interest to anything outside it. State belongs at the lowest level that
    can hold it — pushing it up makes the parent re-render for changes it does
    not care about, and makes both components harder to read.
  */
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleConfirm = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await onConfirm()
      onClose()
    } catch (caught) {
      setError(
        caught instanceof EmployeeError
          ? caught.message
          : 'Something went wrong. Please try again.',
      )
      /*
        Note what does NOT happen here: the dialog stays open. Closing on
        failure would leave the user staring at a list that still shows the
        employee, with no idea whether the delete worked and no way to retry.
      */
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    // The request cannot be recalled; closing mid-flight would leave the user
    // guessing whether it landed.
    if (!isDeleting) onClose()
  }

  return (
    <Modal
      onClose={handleClose}
      eyebrow="Irreversible"
      title="Delete employee"
      className="max-w-md"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {/*
            Cancel precedes Delete in the DOM, so tabbing from the top of the
            dialog reaches the safe option first — and focus opens on the close
            button above, never on the destructive one. Pressing Enter by
            reflex on a dialog you did not expect must not delete anybody.

            `flex-col-reverse` then puts Delete on top on a narrow screen,
            where the primary action belongs under the thumb. Reading order and
            visual order differ deliberately; the DOM order is the one that
            matters for safety.
          */}
          <Button variant="secondary" onClick={handleClose} disabled={isDeleting}>
            Cancel
          </Button>

          <Button variant="danger" onClick={handleConfirm} isLoading={isDeleting}>
            {isDeleting ? 'Deleting…' : 'Delete employee'}
          </Button>
        </div>
      }
    >
      {error && (
        <div
          role="alert"
          className="mb-5 flex items-start gap-3 rounded-control border border-danger-200 bg-danger-50 px-4 py-3 text-sm text-danger-700"
        >
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      {/*
        The name is stated in the sentence, in bold.

        "Are you sure?" on its own is the dialog everybody clicks through
        without reading. Naming the record forces a half-second of recognition
        — and it is the only way to catch the case where the wrong row's
        Delete button was clicked.
      */}
      <p className="text-sm text-ink-700">
        Delete{' '}
        <span className="font-semibold text-ink-900">
          {fullNameOf(employee)}
        </span>{' '}
        ({employee.email}) from the directory?
      </p>

      {/*
        Worded as what actually happens. The backend deactivates the record
        rather than dropping the row — payroll and attendance history point at
        it — but from here the employee is gone from every list and can no
        longer sign in, and nothing in this UI brings them back. Promising
        "permanently erased" would be a lie; implying it is reversible from
        this screen would be a different one.
      */}
      <p className="mt-3 text-sm text-ink-500">
        They will be removed from the directory and will no longer be able to
        sign in. Payroll and attendance history are kept. This cannot be undone
        from here.
      </p>
    </Modal>
  )
}
