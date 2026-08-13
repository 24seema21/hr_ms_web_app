import { StatTile } from '@/shared/components/ui/StatTile'
import {
  CalendarIcon,
  ClockIcon,
  WalletIcon,
  CheckIcon,
} from '@/shared/components/ui/icons'
import { formatDays } from '../lib/leaveDates'
import type { LeaveSummary } from '../lib/leaveSummary'

interface LeaveSummaryTilesProps {
  summary: LeaveSummary
  /** "2026", for the captions. */
  yearLabel: string
}

/**
 * The year in four numbers.
 *
 * Deliberately not four charts. A donut showing "11 of 36" is a worse answer
 * than "11 of 36", and the balance panel below already draws the one shape
 * that earns its ink — a remainder against a ceiling. Same reasoning as the
 * attendance module's analytics row, and the two screens read as one product
 * because of it.
 */
export function LeaveSummaryTiles({
  summary,
  yearLabel,
}: LeaveSummaryTilesProps) {
  const {
    availableDays,
    entitledDays,
    takenDays,
    scheduledDays,
    pendingDays,
    pendingCount,
    unpaidDays,
  } = summary

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatTile
        label="Available"
        value={formatDays(availableDays)}
        // The denominator, stated. A bare "14" invites exactly one question,
        // and scheduled-but-not-yet-taken leave is why the answer surprises.
        caption={`of ${formatDays(entitledDays)} paid days granted in ${yearLabel}`}
        tone="brand"
        icon={<CheckIcon className="h-4 w-4" />}
      />

      <StatTile
        label="Taken"
        value={formatDays(takenDays)}
        caption={
          scheduledDays > 0
            ? `plus ${formatDays(scheduledDays)} already scheduled`
            : 'nothing scheduled ahead'
        }
        tone="neutral"
        icon={<CalendarIcon className="h-4 w-4" />}
      />

      <StatTile
        label="Pending"
        value={formatDays(pendingDays)}
        caption={
          pendingCount === 0
            ? 'nothing awaiting approval'
            : `across ${pendingCount} ${pendingCount === 1 ? 'request' : 'requests'}`
        }
        tone={pendingDays > 0 ? 'accent' : 'neutral'}
        icon={<ClockIcon className="h-4 w-4" />}
      />

      <StatTile
        label="Unpaid"
        value={formatDays(unpaidDays)}
        caption={
          unpaidDays > 0 ? 'deducted from salary' : 'none taken this year'
        }
        tone={unpaidDays > 0 ? 'danger' : 'neutral'}
        icon={<WalletIcon className="h-4 w-4" />}
      />
    </div>
  )
}
