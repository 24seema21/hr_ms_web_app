import { cn } from '@/shared/lib/cn'

interface LogoProps {
  className?: string
  /** Renders the mark only — used where the wordmark would not fit. */
  markOnly?: boolean
}

/**
 * The product mark plus wordmark.
 *
 * The SVG is `aria-hidden` and the name is real text next to it, rather than
 * being baked into the graphic. That way the brand name is selectable,
 * searchable, translatable and readable by a screen reader for free.
 */
export function Logo({ className, markOnly = false }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
        fill="none"
      >
        <rect width="32" height="32" rx="9" className="fill-brand-600" />
        <path
          d="M10 9.5v13M22 9.5v13M10 16h12"
          stroke="white"
          strokeWidth="2.75"
          strokeLinecap="round"
        />
      </svg>
      {!markOnly && (
        <span className="text-lg font-semibold tracking-tight text-ink-900">
          Hark<span className="text-brand-600">HR</span>
        </span>
      )}
    </span>
  )
}
