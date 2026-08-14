import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/*
  ─────────────────────────────────────────────────────────────────────────────
  THE ICON SET
  ─────────────────────────────────────────────────────────────────────────────
  Hand-drawn on a 24×24 grid at a 1.6px stroke, rather than an icon package.

  Two reasons. One: a dependency ships a thousand glyphs so that we can use
  twenty, and tree-shaking an icon library is famously the thing every bundle
  report shows going wrong. Two: consistency — one stroke width, one join
  style, one grid, decided here once. Mixed-weight icons are the single most
  common way a careful interface starts to look assembled from parts.

  Every icon is `aria-hidden`. An icon is never the accessible name of
  anything: the label lives in the button's text or its `aria-label`, which is
  what `IconButton` requires. A decorative glyph announced as "image" is noise.
*/

interface IconProps {
  className?: string
}

interface GlyphProps extends IconProps {
  children: ReactNode
  /** Solid glyphs (the mark, the avatar tile) fill instead of stroke. */
  filled?: boolean
}

function Glyph({ children, className, filled = false }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn('h-5 w-5 shrink-0', className)}
      fill={filled ? 'currentColor' : 'none'}
      stroke={filled ? 'none' : 'currentColor'}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export function SearchIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4 4" />
    </Glyph>
  )
}

export function PlusIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 5v14M5 12h14" />
    </Glyph>
  )
}

export function PencilIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 20h4l10-10a2.83 2.83 0 1 0-4-4L4 16v4Z" />
      <path d="m14.5 6.5 3 3" />
    </Glyph>
  )
}

export function TrashIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 7h16M10 4h4M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
      <path d="M10.5 11v6M13.5 11v6" />
    </Glyph>
  )
}

export function RefreshIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M20 11a8 8 0 0 0-13.7-5.3L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 13.7 5.3L20 16" />
      <path d="M20 20v-4h-4" />
    </Glyph>
  )
}

export function CloseIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M6 6l12 12M18 6L6 18" />
    </Glyph>
  )
}

export function CheckIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="m5 12.5 4.5 4.5L19 7" />
    </Glyph>
  )
}

export function ChevronDownIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="m6 9 6 6 6-6" />
    </Glyph>
  )
}

export function ChevronLeftIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="m15 6-6 6 6 6" />
    </Glyph>
  )
}

export function ChevronRightIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="m9 6 6 6-6 6" />
    </Glyph>
  )
}

/** The neutral state of a sortable column: sortable, not currently sorted. */
export function SortIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="m8 10 4-4 4 4M8 14l4 4 4-4" />
    </Glyph>
  )
}

export function ArrowUpIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 19V5M6 11l6-6 6 6" />
    </Glyph>
  )
}

export function ArrowDownIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </Glyph>
  )
}

export function UsersIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="9" cy="8" r="3.25" />
      <path d="M3.5 19.5a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.5a3.25 3.25 0 0 1 0 6.3" />
      <path d="M17.5 14.6a5.5 5.5 0 0 1 3 4.9" />
    </Glyph>
  )
}

export function GaugeIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 18a8 8 0 1 1 16 0" />
      <path d="m12 14 4-4" />
      <circle cx="12" cy="14" r="1.4" />
    </Glyph>
  )
}

export function LogOutIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M14 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7" />
      <path d="m17 15 3-3-3-3M20 12H10" />
    </Glyph>
  )
}

export function MenuIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Glyph>
  )
}

export function MailIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3" y="5.5" width="18" height="13" rx="2" />
      <path d="m4 7 8 5.5L20 7" />
    </Glyph>
  )
}

export function PhoneIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M6.5 4h3l1.5 4-2 1.5a11 11 0 0 0 5.5 5.5l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16 16 0 0 1 4.5 6.2 2 2 0 0 1 6.5 4Z" />
    </Glyph>
  )
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 21s6.5-5.5 6.5-10.5a6.5 6.5 0 1 0-13 0C5.5 15.5 12 21 12 21Z" />
      <circle cx="12" cy="10.5" r="2.4" />
    </Glyph>
  )
}

export function FilterIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 6h16l-6.2 7v5.5l-3.6 1.8V13L4 6Z" />
    </Glyph>
  )
}

export function AlertIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 4.5 21 19H3l9-14.5Z" />
      <path d="M12 10v4M12 16.5v.5" />
    </Glyph>
  )
}

export function ClockIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.2 2" />
    </Glyph>
  )
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
    </Glyph>
  )
}

export function WalletIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3.5" y="6" width="17" height="13" rx="2.5" />
      <path d="M3.5 10.5h17" />
      <circle cx="16.5" cy="15" r="1.1" />
    </Glyph>
  )
}

export function StarIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="m12 4 2.4 5 5.6.8-4 3.9 1 5.5-5-2.7-5 2.7 1-5.5-4-3.9 5.6-.8L12 4Z" />
    </Glyph>
  )
}

export function ChartIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 19.5h16" />
      <path d="M7 19.5V12M12 19.5V6M17 19.5v-5" />
    </Glyph>
  )
}

export function BuildingIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 20.5h16" />
      <path d="M6 20.5V5a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v15.5" />
      <path d="M15 9.5h2.5a1 1 0 0 1 1 1v10" />
      <path d="M9 8h3M9 11.5h3M9 15h3" />
    </Glyph>
  )
}

export function HomeIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6 9.8v9.7a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.8" />
      <path d="M10 20.5v-5.5h4v5.5" />
    </Glyph>
  )
}

export function LogInIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M10 5H7a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h3" />
      <path d="m14 15 3-3-3-3M17 12H9" />
    </Glyph>
  )
}

/** Light theme. The rays are one path so the stroke joins stay consistent. */
export function SunIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Glyph>
  )
}

/**
 * Dark theme. A crescent cut as a single filled path rather than two
 * overlapping circles — an outline moon at 20px reads as a comma.
 */
export function MoonIcon({ className }: IconProps) {
  return (
    <Glyph className={className} filled>
      <path d="M20.5 14.6A8.6 8.6 0 0 1 9.4 3.5a8.6 8.6 0 1 0 11.1 11.1Z" />
    </Glyph>
  )
}

/** Onboarding: a checklist, because that is literally what a joiner gets. */
export function ChecklistIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 6.5 5.5 8 8.5 5M4 12.5 5.5 14l3-3M4 18.5 5.5 20l3-3" />
      <path d="M12 6.5h8M12 12.5h8M12 18.5h8" />
    </Glyph>
  )
}

/** Assets: the laptop on the desk, which is most of what "asset" means here. */
export function LaptopIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="4" y="5.5" width="16" height="10.5" rx="1.5" />
      <path d="M2.5 19.5h19" />
    </Glyph>
  )
}

/** Tickets: a stub with a perforation down the middle. */
export function TicketIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 8.5V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v1.5a2.5 2.5 0 0 0 0 7V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1.5a2.5 2.5 0 0 0 0-7Z" />
      <path d="M13.5 9v1.5M13.5 13.5V15" />
    </Glyph>
  )
}

/**
 * Goals: concentric rings, not a star.
 *
 * A star means "favourite" everywhere else in software, and a goal is a target
 * you are moving towards — the rings say the second thing without ambiguity.
 */
export function TargetIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </Glyph>
  )
}

/** Probation: a fixed window of time that runs out. */
export function HourglassIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M6 3.5h12M6 20.5h12" />
      <path d="M7.5 3.5v3.2a4 4 0 0 0 1.6 3.2L12 12l-2.9 2.1a4 4 0 0 0-1.6 3.2v3.2" />
      <path d="M16.5 3.5v3.2a4 4 0 0 1-1.6 3.2L12 12l2.9 2.1a4 4 0 0 1 1.6 3.2v3.2" />
    </Glyph>
  )
}

/**
 * The AI assist mark: a four-point spark.
 *
 * Drawn rather than borrowed, at the same 1.6px weight as the rest — the usual
 * imported "sparkle" glyph is a hairline and reads as dirt beside these.
 */
export function SparkIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 3.5c0 4 1.5 5.5 5.5 5.5-4 0-5.5 1.5-5.5 5.5 0-4-1.5-5.5-5.5-5.5 4 0 5.5-1.5 5.5-5.5Z" />
      <path d="M18 15c0 2 .8 2.8 2.8 2.8-2 0-2.8.8-2.8 2.8 0-2-.8-2.8-2.8-2.8 2 0 2.8-.8 2.8-2.8Z" />
    </Glyph>
  )
}

export function ShieldIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M12 3.5 5 6v5.5c0 4.4 2.9 7.7 7 9 4.1-1.3 7-4.6 7-9V6l-7-2.5Z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </Glyph>
  )
}

/** What a plan has not unlocked yet. */
export function LockIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2" />
      <path d="M8 10.5V7.8a4 4 0 0 1 8 0v2.7" />
    </Glyph>
  )
}

export function PaperclipIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M19 11.5 12.5 18a4.6 4.6 0 0 1-6.5-6.5l7-7a3.1 3.1 0 0 1 4.4 4.4l-7 7a1.6 1.6 0 0 1-2.2-2.2l6.3-6.3" />
    </Glyph>
  )
}

export function UploadIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 15.5v3a1.5 1.5 0 0 0 1.5 1.5h13a1.5 1.5 0 0 0 1.5-1.5v-3" />
      <path d="M12 4v11" />
      <path d="m8 8 4-4 4 4" />
    </Glyph>
  )
}

/** The week-grid view toggle: a calendar reduced to its cells. */
export function GridIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <rect x="3.5" y="4.5" width="17" height="15" rx="1.5" />
      <path d="M3.5 9.5h17" />
      <path d="M9 9.5v10M15 9.5v10" />
    </Glyph>
  )
}

/**
 * Settings: two labelled sliders rather than the usual cogwheel.
 *
 * A gear at this stroke weight turns into a smudge at 20px — its teeth are
 * finer than the 1.6px grid the rest of the set is drawn on — and sliders say
 * "configure" just as plainly while staying legible.
 */
export function SlidersIcon({ className }: IconProps) {
  return (
    <Glyph className={className}>
      <path d="M4 8h10M18 8h2M4 16h4M12 16h8" />
      <circle cx="16" cy="8" r="2.2" />
      <circle cx="10" cy="16" r="2.2" />
    </Glyph>
  )
}
