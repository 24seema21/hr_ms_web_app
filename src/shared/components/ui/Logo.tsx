import { cn } from '@/shared/lib/cn'

interface LogoProps {
  className?: string
  /** Renders the mark only — used where the wordmark would not fit. */
  markOnly?: boolean
  /**
   * `light` inverts the wordmark for the dark ink panels (the login brand
   * panel, the closing call to action). The mark itself is legible on both,
   * so only the text changes.
   */
  tone?: 'dark' | 'light'
}

/**
 * The mark is the product's thesis in 32 pixels: two ruled columns of a
 * register, crossed by one filled cell.
 *
 * The SVG is `aria-hidden` and the name is real text next to it, rather than
 * being baked into the graphic. That way the brand name is selectable,
 * searchable, translatable and readable by a screen reader for free.
 */
export function Logo({ className, markOnly = false, tone = 'dark' }: LogoProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <svg
        viewBox="0 0 32 32"
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
        fill="none"
      >
        <rect width="32" height="32" rx="8" className="fill-brand-900" />
        <path
          d="M10 8.5v15M22 8.5v15"
          className="stroke-brand-400"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="7" y="13.5" width="18" height="5" rx="2.5" className="fill-accent-400" />
      </svg>

      {!markOnly && (
        <span
          className={cn(
            'type-wide text-[1.0625rem] font-bold tracking-tight',
            tone === 'light' ? 'text-white' : 'text-ink-900',
          )}
        >
          Hark
          <span className={tone === 'light' ? 'text-accent-300' : 'text-brand-600'}>
            HR
          </span>
        </span>
      )}
    </span>
  )
}
