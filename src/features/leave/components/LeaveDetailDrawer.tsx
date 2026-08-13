import type { ReactNode } from 'react'
import { Badge } from '@/shared/components/ui/Badge'
import { Drawer } from '@/shared/components/ui/Drawer'
import { PaperclipIcon } from '@/shared/components/ui/icons'
import {
  formatDateRange,
  formatDayCount,
  formatLongDate,
} from '../lib/leaveDates'
import {
  DAY_PORTION_PRESENTATION,
  LEAVE_STATUS_PRESENTATION,
  LEAVE_TYPE_PRESENTATION,
} from '../lib/leavePresentation'
import type { LeaveRequest } from '../types'

interface LeaveDetailDrawerProps {
  request: LeaveRequest
  onClose: () => void
}

/**
 * One request, in full.
 *
 * A drawer rather than a modal, following the same rule the dialog does in
 * reverse: this is *reading*, the list behind it stays useful, and nothing
 * here can be got wrong by clicking in the wrong place. It also keeps the
 * table's scroll position, which matters on a list somebody is scanning.
 *
 * The reason and the decision note are why this exists at all — both are
 * sentences, and a sentence in a table cell either truncates or wrecks the
 * row heights.
 */
export function LeaveDetailDrawer({ request, onClose }: LeaveDetailDrawerProps) {
  const type = LEAVE_TYPE_PRESENTATION[request.type]
  const status = LEAVE_STATUS_PRESENTATION[request.status]

  return (
    <Drawer
      onClose={onClose}
      eyebrow={`Request #${request.id}`}
      title={`${type.label} leave`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={status.tone}>{status.label}</Badge>
        <Badge tone={type.tone}>{type.label}</Badge>
        {request.portion !== 'full' && (
          <Badge>{DAY_PORTION_PRESENTATION[request.portion]}</Badge>
        )}
      </div>

      <dl className="mt-6 flex flex-col gap-5">
        <Field label="Dates">
          {formatDateRange(request.startDate, request.endDate)}
        </Field>

        <Field label="Working days">
          <span className="tabular-nums">
            {formatDayCount(request.days)}
          </span>
        </Field>

        <Field label="Reason">
          <span className="text-pretty">{request.reason}</span>
        </Field>

        <Field label="Attachment">
          {request.attachmentName ? (
            /*
              A name and a glyph, not a download link. The demo has no file to
              serve, and a link that 404s is worse than a filename — this
              becomes an anchor to the signed URL the API returns.
            */
            <span className="flex items-center gap-2">
              <PaperclipIcon className="h-4 w-4 shrink-0 text-ink-400" />
              <span className="truncate">{request.attachmentName}</span>
            </span>
          ) : (
            <span className="text-ink-400">None</span>
          )}
        </Field>

        <Field label="Applied on">{formatLongDate(request.appliedOn)}</Field>

        <Field label={status.decisionVerb === 'Awaiting' ? 'Approver' : 'Decided'}>
          {request.decidedOn ? (
            <>
              {status.decisionVerb} by {request.approverName} on{' '}
              {formatLongDate(request.decidedOn)}
            </>
          ) : (
            <>Awaiting {request.approverName}</>
          )}
        </Field>

        {/*
          The refusal, quoted. A rejected row with no reason on it is the
          single most infuriating thing an HR portal can show somebody, and it
          guarantees the conversation happens over email instead.
        */}
        {request.decisionNote && (
          <div className="rounded-control border border-danger-200 bg-danger-50 px-4 py-3">
            <dt className="type-label text-danger-700">Approver's note</dt>
            <dd className="mt-1 text-sm text-pretty text-danger-700">
              {request.decisionNote}
            </dd>
          </div>
        )}
      </dl>
    </Drawer>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="type-label text-ink-500">{label}</dt>
      <dd className="mt-1 text-sm text-ink-900">{children}</dd>
    </div>
  )
}
