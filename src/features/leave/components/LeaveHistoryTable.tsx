import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { PaperclipIcon } from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'
import {
  formatDateRange,
  formatDays,
  formatShortDate,
} from '../lib/leaveDates'
import {
  LEAVE_STATUS_PRESENTATION,
  LEAVE_TYPE_PRESENTATION,
  portionSuffix,
} from '../lib/leavePresentation'
import type { LeaveRequest } from '../types'

interface LeaveHistoryTableProps {
  requests: LeaveRequest[]
  caption: string
  onView: (request: LeaveRequest) => void
}

/*
  The history, as a table from md up and as cards below it.

  Same two-layout approach as `AttendanceDayTable`, for the same reason: six
  columns on a phone means a swipe in each direction to read one row, and the
  horizontal scroll hides exactly the column with the action in it. `md:hidden`
  is `display:none`, so assistive tech sees one of the two and never both.
*/

const COLUMNS = ['Type', 'Dates', 'Days', 'Status', 'Applied', 'Action']

export function LeaveHistoryTable({
  requests,
  caption,
  onView,
}: LeaveHistoryTableProps) {
  return (
    <>
      {/* ── Table, from md up ────────────────────────────────────────────── */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>

          <thead className="border-b border-ink-200 bg-ink-50/70">
            <tr>
              {COLUMNS.map((heading) => (
                <th
                  key={heading}
                  scope="col"
                  className={cn(
                    'type-label px-4 py-3 whitespace-nowrap text-ink-500',
                    heading === 'Days' && 'text-right',
                    heading === 'Action' && 'text-right',
                  )}
                >
                  {heading}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-ink-100">
            {requests.map((request) => {
              const type = LEAVE_TYPE_PRESENTATION[request.type]
              const status = LEAVE_STATUS_PRESENTATION[request.status]
              const portion = portionSuffix(request.portion)

              return (
                <tr
                  key={request.id}
                  className={cn(
                    'transition-colors hover:bg-brand-50/40',
                    // A withdrawn row is history, not a live commitment. Muted
                    // rather than hidden: people look for the one they cancelled.
                    request.status === 'cancelled' && 'text-ink-500',
                  )}
                >
                  <th scope="row" className="px-4 py-3 text-left font-medium">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <span
                        aria-hidden="true"
                        className="h-4 w-1 shrink-0 rounded-full"
                        style={{ background: type.fill }}
                      />
                      <span className="text-ink-900">{type.label}</span>
                    </span>
                  </th>

                  <td className="px-4 py-3 whitespace-nowrap text-ink-700">
                    {formatDateRange(request.startDate, request.endDate)}
                    {portion && (
                      <span className="ml-2 text-xs text-ink-500">{portion}</span>
                    )}
                  </td>

                  <td className="px-4 py-3 text-right font-medium tabular-nums whitespace-nowrap text-ink-900">
                    {formatDays(request.days)}
                  </td>

                  <td className="px-4 py-3">
                    <span className="flex items-center gap-2 whitespace-nowrap">
                      <Badge tone={status.tone}>{status.label}</Badge>
                      {request.attachmentName && (
                        /*
                          Every icon in this set is `aria-hidden`, so the fact
                          the glyph carries is stated beside it for screen
                          readers rather than smuggled into an `aria-label`
                          the component would drop.
                        */
                        <span className="flex items-center">
                          <PaperclipIcon className="h-3.5 w-3.5 text-ink-400" />
                          <span className="sr-only">Has an attachment</span>
                        </span>
                      )}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-ink-600">
                    {formatShortDate(request.appliedOn)}
                  </td>

                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onView(request)}
                      // A dozen buttons called "View" are useless to anyone
                      // navigating by a list of controls.
                      aria-label={`View ${type.label.toLowerCase()} leave from ${formatShortDate(request.startDate)}`}
                    >
                      View
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* ── Cards, below md ──────────────────────────────────────────────── */}
      <ul className="divide-y divide-ink-100 md:hidden">
        {requests.map((request) => {
          const type = LEAVE_TYPE_PRESENTATION[request.type]
          const status = LEAVE_STATUS_PRESENTATION[request.status]
          const portion = portionSuffix(request.portion)

          return (
            <li key={request.id} className="px-4 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="flex items-center gap-2 font-medium text-ink-900">
                  <span
                    aria-hidden="true"
                    className="h-4 w-1 shrink-0 rounded-full"
                    style={{ background: type.fill }}
                  />
                  {type.label}
                  <span className="text-xs font-normal text-ink-500">
                    {formatDays(request.days)}
                    {request.days === 1 ? ' day' : ' days'}
                  </span>
                </p>
                <Badge tone={status.tone}>{status.label}</Badge>
              </div>

              <p className="mt-1.5 pl-3 text-sm text-ink-700">
                {formatDateRange(request.startDate, request.endDate)}
                {portion && (
                  <span className="ml-2 text-xs text-ink-500">{portion}</span>
                )}
              </p>

              <div className="mt-2 flex items-center gap-3 pl-3">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onView(request)}
                  aria-label={`View ${type.label.toLowerCase()} leave from ${formatShortDate(request.startDate)}`}
                >
                  View
                </Button>
                {request.attachmentName && (
                  <span className="flex items-center gap-1 text-xs text-ink-500">
                    <PaperclipIcon className="h-3.5 w-3.5" />
                    Attached
                  </span>
                )}
                <span className="ml-auto font-mono text-xs text-ink-500">
                  {formatShortDate(request.appliedOn)}
                </span>
              </div>
            </li>
          )
        })}
      </ul>
    </>
  )
}
