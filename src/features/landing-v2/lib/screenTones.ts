/*
  The three tones every fabricated screen on this page speaks in.

  They are a map in one module rather than a ternary at each call site because
  they have to mean the same thing in the hero preview, the attendance screen
  and the leave queue, or the pictures stop being readable as one product:

    jade    settled — nothing to do
    violet  elsewhere, and fine — remote, or the machine's half of the work
    amber   the only state that wants a human

  Kept out of a component file so that importing the map does not cost a
  component its hot reload: `eslint-plugin-react-refresh` requires a module
  that exports a component to export nothing else.
*/
export const SCREEN_TONES = {
  jade: 'bg-nx-jade-soft text-nx-jade-ink',
  violet: 'bg-nx-violet-soft text-nx-violet-ink',
  amber: 'bg-nx-amber-soft text-nx-amber-ink',
} as const

export type ScreenTone = keyof typeof SCREEN_TONES

/** The solid fills, for meters and dots where a tint would disappear. */
export const SCREEN_FILLS = {
  jade: 'bg-nx-jade',
  violet: 'bg-nx-violet',
  amber: 'bg-nx-amber',
} as const
