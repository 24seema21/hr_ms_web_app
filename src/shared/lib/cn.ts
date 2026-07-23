/**
 * Joins class names, dropping anything falsy.
 *
 * Without it, conditional classes turn into unreadable template strings that
 * leak `undefined` and `false` into the DOM:
 *
 *   className={`btn ${isActive && 'btn-active'} ${size ? sizes[size] : ''}`}
 *   → "btn false "
 *
 * With it:
 *
 *   className={cn('btn', isActive && 'btn-active', sizes[size])}
 *   → "btn btn-active btn-lg"
 *
 * (This is the tiny hand-rolled version of the `clsx` package. Note that it
 * only concatenates — it does not resolve conflicting Tailwind utilities.
 * Keep the "last one wins" ordering in mind when overriding styles.)
 */
export type ClassValue = string | false | null | undefined

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(' ')
}
