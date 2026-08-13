import { cn } from '@/shared/lib/cn'
import {
  dayOfMonth,
  formatDuration,
  formatWeekday,
} from '../lib/leaveDates'
import {
  WEEK_DAY_PRESENTATION,
  WEEK_EVENT_PRESENTATION,
} from '../lib/leavePresentation'
import type { WeekDay } from '../types'

interface WeekGridViewProps {
  week: WeekDay[]
  todayWorkDate: string
}

/*
  The same week as a calendar strip: seven cells, each carrying its state and
  whatever is on it.

  This is the view that answers "what is happening on Thursday" — the bar chart
  answers "how did the week go", and neither answers the other's question,
  which is why the card carries both rather than picking one.

  Seven columns from `sm` up and a stacked list below it. A seven-column grid
  on a 375px phone gives each day 44px, which fits a date and nothing else —
  and the events are the entire reason for this view.
*/
export function WeekGridView({ week, todayWorkDate }: WeekGridViewProps) {
  return (
    /*
      `flex-1` inside the card's panel, so the cells stretch into whatever
      height the taller view (the bar chart) established. Without it the grid
      sits at its natural height and leaves a band of dead space under the
      shorter of the two views.
    */
    <ul className="grid flex-1 gap-2 sm:grid-cols-7">
      {week.map((day) => {
        const presentation = WEEK_DAY_PRESENTATION[day.kind]
        const isToday = day.workDate === todayWorkDate

        return (
          <li
            key={day.workDate}
            className={cn(
              'flex gap-3 rounded-control border p-2.5 transition-colors sm:flex-col sm:gap-2',
              isToday
                ? 'border-accent-300 bg-accent-50/50'
                : presentation.isOffDay
                  ? 'border-ink-200 bg-ink-50/50'
                  : 'border-ink-200 bg-surface',
            )}
          >
            <div className="flex shrink-0 items-baseline gap-2 sm:justify-between">
              <span
                className={cn(
                  'type-label',
                  isToday ? 'text-accent-700' : 'text-ink-500',
                )}
              >
                {formatWeekday(day.workDate)}
              </span>
              <span
                className={cn(
                  'font-mono text-sm tabular-nums',
                  isToday ? 'font-semibold text-ink-900' : 'text-ink-600',
                )}
              >
                {dayOfMonth(day.workDate)}
              </span>
            </div>

            <div className="min-w-0 flex-1">
              {/*
                Dot *and* word. A coloured dot alone says nothing to a screen
                reader and roughly one man in twelve cannot separate the green
                from the marigold beside it.
              */}
              <p className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className={cn(
                    'h-2 w-2 shrink-0 rounded-full',
                    presentation.dot,
                  )}
                />
                <span className="truncate text-xs font-medium text-ink-800">
                  {presentation.label}
                </span>
              </p>

              {day.workedMinutes > 0 && (
                <p className="mt-0.5 pl-3.5 font-mono text-[0.625rem] tabular-nums text-ink-500">
                  {formatDuration(day.workedMinutes)}
                </p>
              )}

              {day.events.length > 0 && (
                <ul className="mt-2 flex flex-col gap-1">
                  {day.events.map((event) => (
                    <li
                      key={event.id}
                      className="flex items-start gap-1.5 text-[0.6875rem] leading-tight text-ink-600"
                    >
                      <span
                        aria-hidden="true"
                        className={cn(
                          'mt-1 h-1.5 w-1.5 shrink-0 rounded-full',
                          WEEK_EVENT_PRESENTATION[event.kind].accent,
                        )}
                      />
                      <span className="min-w-0">
                        {/*
                          The kind is announced but not drawn: the coloured dot
                          is the sighted shorthand, and repeating "Meeting:"
                          before every title would cost the width the titles
                          need.
                        */}
                        <span className="sr-only">
                          {WEEK_EVENT_PRESENTATION[event.kind].label}:{' '}
                        </span>
                        <span className="line-clamp-2">{event.title}</span>
                        {event.startTime && (
                          <span className="ml-1 font-mono text-ink-400">
                            {event.startTime}
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}
