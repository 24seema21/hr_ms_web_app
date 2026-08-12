import { Button } from '@/shared/components/ui/Button'
import { LogInIcon, LogOutIcon } from '@/shared/components/ui/icons'
import type { AttendanceAction } from '../lib/attendanceState'

interface CheckInOutButtonProps {
  action: AttendanceAction
  isBusy: boolean
  onCheckIn: () => void
  onCheckOut: () => void
  className?: string
}

/**
 * The one control the whole dashboard is built around.
 *
 * Its label is the *outcome*, not the mechanism — "Check out", never "Submit"
 * — so the accessible name answers the question a screen-reader user is
 * actually asking, and the visible text changes as the state does, which is
 * also how the change gets announced without a live region.
 *
 * `check_in` covers two states that look different but want the same button:
 * nothing recorded yet, and back from lunch. The second says "Check in again"
 * so nobody thinks the morning was lost.
 */
export function CheckInOutButton({
  action,
  isBusy,
  onCheckIn,
  onCheckOut,
  className,
}: CheckInOutButtonProps) {
  if (action === 'check_out') {
    return (
      /*
        Marigold, not the brand green and not a quiet outline.

        Two things had to be true at once: this is the most important control
        on the page while a session is running, so an outlined button is too
        timid — and it must not look like the green "Check in" it replaced, or
        muscle memory will close the day at lunchtime. The accent is the
        product's "mark this cell" colour, which is exactly what checking out
        does, and dark ink on marigold clears contrast comfortably.
      */
      <Button
        size="lg"
        variant="accent"
        isLoading={isBusy}
        onClick={onCheckOut}
        className={className}
      >
        {!isBusy && <LogOutIcon className="h-5 w-5" />}
        {isBusy ? 'Checking out…' : 'Check out'}
      </Button>
    )
  }

  if (action === 'check_in') {
    return (
      <Button
        size="lg"
        isLoading={isBusy}
        onClick={onCheckIn}
        className={className}
      >
        {!isBusy && <LogInIcon className="h-5 w-5" />}
        {isBusy ? 'Checking in…' : 'Check in'}
      </Button>
    )
  }

  /*
    Nothing is offered on a weekend, a holiday, an approved leave day or a day
    already settled. A disabled button would be worse than none: it is a
    control that looks like it should work, gives no reason when it does not,
    and is skipped by most screen readers so its explanation never gets read.
    The card writes a sentence instead.
  */
  return null
}
