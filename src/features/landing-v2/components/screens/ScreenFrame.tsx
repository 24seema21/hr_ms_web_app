import type { ReactNode } from 'react'
import {
  CalendarIcon,
  ClockIcon,
  GaugeIcon,
  SlidersIcon,
  UsersIcon,
} from '@/shared/components/ui/icons'
import { cn } from '@/shared/lib/cn'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE SCREENSHOT THAT IS NOT A SCREENSHOT
  ─────────────────────────────────────────────────────────────────────────────
  Window chrome, workspace nav and a page header — everything that is identical
  across the hero preview and the three tour screens, so that the only thing
  each of those files contains is the screen it is actually about.

  Built from tokens rather than captured as an image. A PNG of a light screen
  is a white slab on a dark page for half the visitors, weighs 300KB at 2x, and
  goes stale the first time somebody changes a control — silently, because
  nothing in the build can tell that the picture and the product have diverged.
*/

const NAV = [
  { id: 'dashboard', label: 'Dashboard', Icon: GaugeIcon },
  { id: 'people', label: 'People', Icon: UsersIcon },
  { id: 'attendance', label: 'Attendance', Icon: ClockIcon },
  { id: 'leave', label: 'Leave', Icon: CalendarIcon },
  { id: 'settings', label: 'Settings', Icon: SlidersIcon },
] as const

interface ScreenFrameProps {
  /** Which nav item reads as current, matched against `NAV` by id. */
  activeNav: (typeof NAV)[number]['id']
  /** The path in the address pill — the real route this screen lives at. */
  path: string
  /** The page heading inside the workspace. */
  title: string
  /** The line beside it: a date range, a count, whatever scopes the screen. */
  meta: string
  children: ReactNode
}

export function ScreenFrame({
  activeNav,
  path,
  title,
  meta,
  children,
}: ScreenFrameProps) {
  return (
    /*
      `aria-hidden` on the whole frame. Every screen inside it is a hundred
      fragments of fabricated text, and a screen reader walking through them
      one at a time learns nothing — the caption above each panel, and the
      figcaption in the hero, say what the picture shows in one sentence
      instead. That is the same courtesy as alt text on a photograph.
    */
    <div
      aria-hidden="true"
      className="overflow-hidden rounded-nx-lg border border-nx-line bg-nx-surface shadow-nx-hero"
    >
      {/* ── Window chrome ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 border-b border-nx-line bg-nx-bg/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-nx-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-nx-line-strong" />
          <span className="h-2.5 w-2.5 rounded-full bg-nx-line-strong" />
        </div>
        <span className="mx-auto truncate rounded-full bg-nx-bg px-3 py-1 font-mono text-[0.625rem] text-nx-faint">
          unityportal.app{path}
        </span>
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-nx-jade text-[0.625rem] font-bold text-nx-on-fill">
          AR
        </span>
      </div>

      <div className="flex">
        {/*
          The nav is dropped below `md`. Fitting five items and a four-column
          table into 375px means shrinking both until neither is legible, and
          the nav is the half a reader can infer.
        */}
        <div className="hidden w-40 shrink-0 border-r border-nx-line p-3 md:block">
          <p className="px-2.5 pb-2 font-mono text-[0.625rem] tracking-widest text-nx-faint uppercase">
            Workspace
          </p>
          {NAV.map((item) => (
            <span
              key={item.id}
              className={cn(
                'mt-0.5 flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium',
                item.id === activeNav
                  ? 'bg-nx-jade-soft text-nx-jade-ink'
                  : 'text-nx-muted',
              )}
            >
              <item.Icon className="h-3.5 w-3.5" />
              {item.label}
            </span>
          ))}
        </div>

        <div className="min-w-0 flex-1 p-4 sm:p-5">
          <div className="flex items-baseline justify-between gap-3">
            <p className="type-tight text-base font-bold text-nx-ink">
              {title}
            </p>
            <span className="shrink-0 rounded-full bg-nx-bg px-2.5 py-1 font-mono text-[0.625rem] text-nx-muted">
              {meta}
            </span>
          </div>

          {children}
        </div>
      </div>
    </div>
  )
}

/* ── Small parts shared by more than one screen ──────────────────────── */

/** A column header or field label, in the product's data voice. */
export function ScreenLabel({ children }: { children: ReactNode }) {
  return (
    <span className="font-mono text-[0.625rem] tracking-widest text-nx-faint uppercase">
      {children}
    </span>
  )
}

/** A card on the screen's ground. */
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
        'overflow-hidden rounded-xl border border-nx-line',
        className,
      )}
    >
      {children}
    </div>
  )
}
