import type { BadgeTone } from '@/shared/components/ui/Badge'
import type {
  DayPortion,
  LeaveStatus,
  LeaveType,
  WeekDayKind,
  WeekEventKind,
} from '../types'

/*
  How every leave value is said and shown, for the whole module.

  In `lib/` rather than beside a component because the table, the charts, the
  balance panel and the week card all need the same words — and because a file
  that exports a component *and* a lookup table loses Vite's fast refresh
  (`react-refresh/only-export-components`). Same reasoning as the attendance
  module's `statePresentation.ts`.

  Every entry has a **word**. Colour is never the only carrier of meaning here:
  a green swatch says nothing to a screen reader, and roughly one man in twelve
  cannot reliably separate it from the marigold beside it.
*/

export interface LeaveTypePresentation {
  label: string
  /** One line for the balance panel — what this type is actually for. */
  blurb: string
  tone: BadgeTone
  /**
   * The chart fill, as a `var()` reference to a design token rather than a hex.
   *
   * These point at the dedicated `--color-chart-*` tokens rather than at the
   * UI ramps, and that separation is deliberate: a chart fill and an error
   * message have different jobs, and the dark red that keeps the sick-leave
   * bar distinct from its neighbour is too dark to serve as error text. Tying
   * them together means every chart tweak risks a button. See the note beside
   * the tokens in `index.css` for the validated numbers in both themes.
   *
   * Because they are tokens, the charts re-theme with the rest of the product
   * and there is no `isDark` prop threaded through five components.
   */
  fill: string
  /** The same hue, much dimmer: meter tracks and hover washes. */
  track: string
}

export const LEAVE_TYPE_PRESENTATION: Record<LeaveType, LeaveTypePresentation> =
  {
    earned: {
      label: 'Earned',
      blurb: 'Accrues monthly. Carries over, and is paid out if unused.',
      tone: 'brand',
      fill: 'var(--color-chart-earned)',
      track: 'var(--color-chart-earned-track)',
    },
    casual: {
      label: 'Casual',
      blurb: 'Short notice, personal errands. Lapses at the end of the year.',
      tone: 'accent',
      fill: 'var(--color-chart-casual)',
      track: 'var(--color-chart-casual-track)',
    },
    sick: {
      label: 'Sick',
      blurb: 'Illness and medical appointments. Certificate over two days.',
      tone: 'danger',
      fill: 'var(--color-chart-sick)',
      track: 'var(--color-chart-sick-track)',
    },
    unpaid: {
      label: 'Unpaid',
      blurb: 'Taken once the paid balance is spent. Deducted from salary.',
      tone: 'neutral',
      fill: 'var(--color-chart-unpaid)',
      track: 'var(--color-chart-unpaid-track)',
    },
  }

export interface LeaveStatusPresentation {
  label: string
  tone: BadgeTone
  /** Past tense, for the "applied 3 days ago / decided on the 4th" line. */
  decisionVerb: string
}

export const LEAVE_STATUS_PRESENTATION: Record<
  LeaveStatus,
  LeaveStatusPresentation
> = {
  pending: { label: 'Pending', tone: 'accent', decisionVerb: 'Awaiting' },
  approved: { label: 'Approved', tone: 'success', decisionVerb: 'Approved' },
  rejected: { label: 'Rejected', tone: 'danger', decisionVerb: 'Rejected' },
  cancelled: { label: 'Cancelled', tone: 'neutral', decisionVerb: 'Withdrawn' },
}

export const DAY_PORTION_PRESENTATION: Record<DayPortion, string> = {
  full: 'Full day',
  first_half: 'First half',
  second_half: 'Second half',
}

/** The portion, only when it is worth saying. A full day is the default. */
export function portionSuffix(portion: DayPortion): string | null {
  return portion === 'full' ? null : DAY_PORTION_PRESENTATION[portion]
}

export interface WeekDayPresentation {
  label: string
  tone: BadgeTone
  /** Tailwind classes for the week grid's status dot. */
  dot: string
  /** True when the day owed no work, so the bar view shows a marker not a bar. */
  isOffDay: boolean
}

export const WEEK_DAY_PRESENTATION: Record<WeekDayKind, WeekDayPresentation> = {
  present: {
    label: 'Present',
    tone: 'success',
    dot: 'bg-success-600',
    isOffDay: false,
  },
  half_day: {
    label: 'Half day',
    tone: 'accent',
    dot: 'bg-accent-400',
    isOffDay: false,
  },
  leave: {
    label: 'On leave',
    tone: 'brand',
    dot: 'border-2 border-brand-500 bg-transparent',
    isOffDay: true,
  },
  holiday: {
    label: 'Holiday',
    tone: 'neutral',
    dot: 'bg-ink-300',
    isOffDay: true,
  },
  weekend: {
    label: 'Weekend',
    tone: 'neutral',
    dot: 'bg-ink-300',
    isOffDay: true,
  },
  absent: {
    label: 'Absent',
    tone: 'danger',
    dot: 'bg-danger-600',
    isOffDay: false,
  },
  upcoming: {
    label: 'Upcoming',
    tone: 'neutral',
    dot: 'border-2 border-ink-300 bg-transparent',
    isOffDay: false,
  },
}

export const WEEK_EVENT_PRESENTATION: Record<
  WeekEventKind,
  { label: string; accent: string }
> = {
  meeting: { label: 'Meeting', accent: 'bg-brand-400' },
  holiday: { label: 'Holiday', accent: 'bg-ink-300' },
  birthday: { label: 'Birthday', accent: 'bg-accent-400' },
  deadline: { label: 'Deadline', accent: 'bg-danger-600' },
}
