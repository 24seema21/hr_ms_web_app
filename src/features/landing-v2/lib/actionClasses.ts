import { cn } from '@/shared/lib/cn'

/*
  The v2 button look, kept apart from the product's `buttonStyles.ts` for the
  same reason the `nx-` tokens are kept apart from the ramps: this is a
  candidate design, and it must be possible to delete it without touching a
  control the signed-in app depends on.

  The shape is the loudest difference. The product's buttons are 8px-radius
  rectangles because they sit in dense toolbars and tables where a pill wastes
  horizontal space; a landing page has nothing but space, and the full-radius
  pill is most of what dates a page to this decade rather than the last.

  Same split as the product, and for the same reason: the *look* lives here so
  that a real `<a>` and a real `<button>` can share it without one being nested
  inside the other.
*/

const variantClasses = {
  /** The one primary action per section. */
  primary:
    'bg-nx-jade text-nx-on-fill shadow-nx-soft hover:bg-nx-jade-hover hover:shadow-nx-lift',
  /*
    The secondary action, drawn as glass rather than as a filled grey. On a
    page whose ground is a moving gradient field, an opaque button punches a
    hole in the atmosphere; a translucent one sits in it.
  */
  ghost:
    'nx-glass border border-nx-line-strong text-nx-ink hover:border-nx-jade-line hover:text-nx-jade-ink',
  /** A tertiary action that still needs to read as ours. */
  soft: 'bg-nx-jade-soft text-nx-jade-ink hover:bg-nx-jade-line',
  /*
    On the gradient panel in the closing call to action. Literal white and a
    fixed dark ink, not tokens: that panel is dark in both themes, so a token
    would flip out from under the button and leave dark-on-dark.
  */
  inverse: 'bg-white text-nx-panel-ink shadow-nx-soft hover:bg-white/90',
  /** Its quieter partner on the same panel — the border carries the shape. */
  outline:
    'border border-white/30 text-white hover:border-white/60 hover:bg-white/10',
} as const

const sizeClasses = {
  sm: 'h-9 gap-1.5 px-4 text-sm',
  md: 'h-11 gap-2 px-5 text-sm',
  lg: 'h-13 gap-2.5 px-7 text-base',
} as const

export type ActionVariant = keyof typeof variantClasses
export type ActionSize = keyof typeof sizeClasses

export function actionClasses(
  variant: ActionVariant,
  size: ActionSize,
  className?: string,
): string {
  return cn(
    'inline-flex cursor-pointer items-center justify-center rounded-full font-semibold whitespace-nowrap',
    /*
      The lift on hover is one pixel. It is enough to register as a response
      and small enough that a row of buttons does not appear to bounce; the
      shadow growing at the same time is what sells it as height rather than
      as movement. `prefers-reduced-motion` collapses the duration globally
      (see index.css), which leaves the colour change and drops the travel.
    */
    'transition-[color,background-color,border-color,box-shadow,translate] duration-200 ease-out-quart',
    'hover:-translate-y-px active:translate-y-0',
    'disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
