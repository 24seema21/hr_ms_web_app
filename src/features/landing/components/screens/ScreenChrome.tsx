import type { ReactNode } from 'react'
import { Logo } from '@/shared/components/ui/Logo'
import { cn } from '@/shared/lib/cn'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE SCREENSHOT THAT IS NOT A SCREENSHOT
  ─────────────────────────────────────────────────────────────────────────────
  Every panel in the product tour is real markup built from the product's own
  design tokens, not a PNG.

  Three reasons, and the third is the one that decided it. A PNG of a light-mode
  screen is a white rectangle on a dark page for every visitor using dark mode.
  A PNG at 2x is 300KB before anyone has read a word. And a PNG goes stale the
  first time somebody changes a button, silently, because nothing in the build
  can tell that the picture and the product have diverged.

  Built from tokens, the panels follow the theme, weigh nothing, and drift only
  as far as the tokens do.

  What they are *not* is live: every number below is static marketing content.
  That is why these live in `features/landing` and import nothing from the
  attendance, leave or settings slices — a landing page that pulls in three
  feature modules to draw a picture of them is a landing page that ships them
  in its bundle.
*/

interface ScreenChromeProps {
  /** The nav item to show as current, matched against `NAV_ITEMS` by label. */
  activeNav: string
  /** The page title inside the workspace, e.g. "Attendance". */
  title: string
  /** The line under the title — dates, counts, whatever the screen is scoped to. */
  subtitle: string
  /** The right-hand end of the page header: a filter, a date range, a button. */
  action?: ReactNode
  children: ReactNode
}

const NAV_ITEMS = [
  'Dashboard',
  'People',
  'Attendance',
  'Leave',
  'Settings',
] as const

export function ScreenChrome({
  activeNav,
  title,
  subtitle,
  action,
  children,
}: ScreenChromeProps) {
  return (
    <div className="overflow-hidden rounded-panel border border-ink-200 bg-shell shadow-raised">
      {/* ── The workspace header ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 border-b border-ink-200 bg-surface px-3 py-2.5 sm:px-4">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Mark only: the wordmark plus five nav items does not fit the
              panel at tablet width, and the mark is the recognisable half. */}
          <Logo markOnly className="[&>svg]:h-6 [&>svg]:w-6" />

          <nav aria-hidden="true" className="hidden items-center gap-1 sm:flex">
            {NAV_ITEMS.map((item) => (
              <span
                key={item}
                className={cn(
                  'rounded-control px-2.5 py-1 text-xs font-medium',
                  item === activeNav
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-500',
                )}
              >
                {item}
              </span>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <span className="type-label hidden text-ink-400 sm:inline">
            Pune HQ
          </span>
          <span className="type-label flex h-7 w-7 items-center justify-center rounded-full bg-panel text-panel-mark">
            AR
          </span>
        </div>
      </div>

      {/* ── The page header ───────────────────────────────────────────── */}
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-ink-200 bg-surface px-3 pt-4 pb-4 sm:px-5">
        <div>
          <h3 className="type-wide text-lg font-bold text-ink-900">{title}</h3>
          <p className="mt-0.5 font-mono text-xs text-ink-500">{subtitle}</p>
        </div>
        {action}
      </div>

      {/* ── The screen itself ─────────────────────────────────────────── */}
      <div className="bg-shell p-3 sm:p-5">{children}</div>
    </div>
  )
}

/* ── Small parts shared by more than one screen ──────────────────────── */

/**
 * A card on the workspace ground.
 *
 * The signed-in app makes cards read as objects on a desk by keeping the
 * workspace a shade darker than the card; these panels inherit that
 * relationship rather than restating it in hexes.
 */
export function ScreenCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-card border border-ink-200 bg-surface shadow-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

/** A column header, in the register's label voice. */
export function ScreenLabel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span className={cn('type-label text-ink-400', className)}>{children}</span>
  )
}

const pillTones = {
  brand: 'bg-brand-50 text-brand-700',
  accent: 'bg-accent-50 text-accent-700',
  success: 'bg-success-50 text-success-700',
  danger: 'bg-danger-50 text-danger-700',
  neutral: 'bg-ink-100 text-ink-600',
} as const

/** The status chip used inside table rows. Tones, not colours — see Badge. */
export function ScreenPill({
  children,
  tone = 'neutral',
}: {
  children: ReactNode
  tone?: keyof typeof pillTones
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[0.625rem] whitespace-nowrap',
        pillTones[tone],
      )}
    >
      {children}
    </span>
  )
}
