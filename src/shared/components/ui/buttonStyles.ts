import { cn } from '@/shared/lib/cn'

/*
  The button *look*, extracted from the button *element*.

  We need two different elements that look identical: a real `<button>` for
  actions (submitting the login form) and a real `<a>` for navigation (the
  landing-page CTAs). Nesting one inside the other — `<button><a/></button>` —
  is invalid HTML and breaks keyboard and screen-reader behaviour, so instead
  both components import this one recipe. One definition, two elements, zero
  duplicated Tailwind strings.

  It also lives in its own module so Button.tsx and ButtonLink.tsx each export
  nothing but a component, which is what keeps Vite's fast refresh working.
*/

/*
  The fills below carry text, which is the one place the token swap is not
  enough on its own.

  Everywhere else a colour sits *behind* text that lives on the surface, so
  re-pointing the ramp moves both together. A filled button is the exception:
  its label's contrast is against the fill, not the page, and the fill changes
  direction between themes — light mode's primary is a deep ink green under
  white text, dark mode's is a luminous green that white would disappear on.

  Hence `text-on-brand` / `text-on-danger` / `text-on-accent`: the role is
  "whatever reads on that fill", and each theme answers it. No `dark:` variants
  needed, and no way to add a button that is legible in only one theme.
*/
const variantClasses = {
  /* The one primary action per view. Ink green in light, a lifted green in
     dark; the label follows the fill. */
  primary:
    'bg-brand-600 text-on-brand shadow-card hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'border border-ink-300 bg-surface text-ink-800 shadow-card hover:border-ink-400 hover:bg-ink-50 active:bg-ink-100',
  /*
    Marigold, and deliberately rationed: it is the mark colour, so a second
    marigold button on the same screen makes both of them mean nothing. Dark
    ink on the fill rather than white — marigold is far too light to carry
    white text (2.1:1), and it stays light in dark mode, so the label stays
    dark in both.
  */
  accent:
    'bg-accent-400 text-on-accent shadow-card hover:bg-accent-300 active:bg-accent-500',
  /* Tertiary actions inside dense chrome — toolbars, table rows, dialogs. */
  ghost: 'text-ink-700 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200',
  /* Ghost's tinted sibling, for when an action needs to read as *ours*. */
  quiet: 'bg-brand-50 text-brand-700 hover:bg-brand-100 active:bg-brand-200',
  /*
    On the dark ink panels: the hero band, the closing call to action. Those
    panels are dark in *both* themes, so this button is too — literal white
    with the panel's own green as its label, rather than tokens that would
    flip out from under it and put a dark button on a dark panel.
  */
  inverse:
    'bg-white text-panel shadow-card hover:bg-inverse-hover active:bg-inverse-hover',
  /* Reserved for irreversible actions — deleting an employee, and nothing else
     yet. Red is a finite resource in an interface: use it on a "Save" button
     and it stops meaning "careful" on the one button where that matters. */
  danger:
    'bg-danger-600 text-on-danger shadow-card hover:bg-danger-700 active:bg-danger-700',
} as const

const sizeClasses = {
  xs: 'h-8 gap-1.5 px-2.5 text-xs',
  sm: 'h-9 gap-1.5 px-3.5 text-sm',
  md: 'h-10 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-6 text-base',
} as const

/*
  `keyof typeof variantClasses` derives the union straight from the object
  above. Add a variant to the map and it instantly becomes a legal prop value —
  there is no second list that can fall out of sync.
*/
export type ButtonVariant = keyof typeof variantClasses
export type ButtonSize = keyof typeof sizeClasses

export function buttonClasses(
  variant: ButtonVariant,
  size: ButtonSize,
  className?: string,
): string {
  return cn(
    'inline-flex cursor-pointer items-center justify-center rounded-control font-medium whitespace-nowrap',
    // Only the properties that actually change are transitioned. `transition-all`
    // also animates layout properties, which is how a hover ends up costing a
    // reflow on every frame.
    'transition-[color,background-color,border-color,box-shadow] duration-150',
    'disabled:cursor-not-allowed disabled:opacity-55 disabled:shadow-none',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
