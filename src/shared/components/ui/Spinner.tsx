import { cn } from '@/shared/lib/cn'

interface SpinnerProps {
  className?: string
}

/**
 * A purely decorative loading indicator.
 *
 * `aria-hidden` is deliberate: a screen reader announcing "image" here adds
 * nothing. The *meaning* ("we are working on it") is carried by the
 * surrounding element's `aria-busy` / visible text instead.
 */
export function Spinner({ className }: SpinnerProps) {
  return (
    <svg
      className={cn('h-4 w-4 animate-spin', className)}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  )
}
