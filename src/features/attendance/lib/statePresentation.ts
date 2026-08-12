import type { DayState } from '../types'

/*
  How every attendance state is said and shown, for the whole product.

  In `lib/` rather than beside the component that renders it, for two reasons:
  the weekly table, the history rows and the detail drawer all need the same
  words as the dashboard card, and a file that exports a component *and* a
  lookup table loses Vite's fast refresh (`react-refresh/only-export-components`).

  Every entry has a **word**. Colour is never the only carrier of meaning: a
  green dot says nothing to a screen reader, and roughly one man in twelve
  cannot reliably tell it from the amber one beside it.
*/
export interface StatePresentation {
  label: string
  /** Tailwind classes for the 10px dot. */
  dot: string
  /** Text colour for the label. */
  text: string
  /** Only 'working' pulses — it is the one state that is still happening. */
  pulse?: boolean
}

export const STATE_PRESENTATION: Record<DayState, StatePresentation> = {
  not_checked_in: {
    label: 'Not checked in',
    dot: 'border-2 border-ink-400 bg-transparent',
    text: 'text-ink-600',
  },
  working: {
    label: 'Working',
    dot: 'bg-brand-600',
    text: 'text-brand-700',
    pulse: true,
  },
  on_break: {
    label: 'On break',
    dot: 'bg-accent-400',
    text: 'text-accent-700',
  },
  completed: {
    label: 'Completed',
    dot: 'bg-success-600',
    text: 'text-success-700',
  },
  half_day: {
    label: 'Half day',
    dot: 'bg-accent-400',
    text: 'text-accent-700',
  },
  absent: {
    label: 'Absent',
    dot: 'bg-danger-600',
    text: 'text-danger-700',
  },
  regularization_pending: {
    label: 'Regularisation pending',
    dot: 'border-2 border-accent-500 bg-transparent',
    text: 'text-accent-700',
  },
  regularized: {
    label: 'Regularised',
    dot: 'border-2 border-success-600 bg-transparent',
    text: 'text-success-700',
  },
  regularization_rejected: {
    label: 'Regularisation rejected',
    dot: 'border-2 border-danger-600 bg-transparent',
    text: 'text-danger-700',
  },
  leave: {
    label: 'On leave',
    dot: 'border-2 border-brand-500 bg-transparent',
    text: 'text-brand-700',
  },
  holiday: {
    label: 'Holiday',
    dot: 'bg-ink-300',
    text: 'text-ink-600',
  },
  weekend: {
    label: 'Weekend',
    dot: 'bg-ink-300',
    text: 'text-ink-600',
  },
}

/** The label for a state, for sentences, aria-labels and table cells. */
export function labelForState(state: DayState): string {
  return STATE_PRESENTATION[state].label
}
