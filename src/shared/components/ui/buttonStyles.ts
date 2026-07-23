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

const variantClasses = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 active:bg-brand-800',
  secondary:
    'border border-ink-300 bg-white text-ink-800 hover:bg-ink-50 active:bg-ink-100',
  ghost: 'text-brand-700 hover:bg-brand-50 active:bg-brand-100',
  inverse:
    'bg-white text-brand-700 shadow-sm hover:bg-brand-50 active:bg-brand-100',
} as const

const sizeClasses = {
  sm: 'h-9 px-3.5 text-sm',
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-6 text-base',
} as const

/*
  `keyof typeof variantClasses` derives the union
  'primary' | 'secondary' | 'ghost' | 'inverse' straight from the object above.
  Add a variant to the map and it instantly becomes a legal prop value —
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
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-control font-medium whitespace-nowrap transition-colors',
    'disabled:cursor-not-allowed disabled:opacity-60',
    variantClasses[variant],
    sizeClasses[size],
    className,
  )
}
