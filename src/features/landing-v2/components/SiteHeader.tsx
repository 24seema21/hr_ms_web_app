import { Link } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { ROUTES } from '@/shared/constants/routes'
import { HEADER_SECTIONS } from '../data/sections'
import { ActionLink } from './ActionLink'

/**
 * `<header>` is a landmark: a screen-reader user can jump straight to it, and
 * straight past it. A `<div className="header">` offers neither.
 *
 * Glass rather than a solid bar, because the aurora runs underneath the whole
 * page and an opaque strip across the top would cut the field in half at the
 * exact place the eye starts. The hairline underneath is what keeps it from
 * dissolving into the content when a white card scrolls behind it.
 */
export function SiteHeader() {
  return (
    <header className="nx-glass sticky top-0 z-50 border-b border-nx-line">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          to={ROUTES.LANDING_V2}
          aria-label="Unity Portal home"
          className="flex items-center gap-2.5"
        >
          {/*
            The product's real mark, with a wordmark set in this page's own
            palette beside it.

            `markOnly` and a local wordmark rather than the shared component's:
            the mark is brand identity and is not this redesign's to change,
            but its default wordmark is coloured from the `brand` ramp — a
            deeper, greyer green than the jade everything else here uses, which
            next to it reads as a colour mistake rather than a second brand.
          */}
          <Logo markOnly />
          <span className="type-tight text-[1.0625rem] font-extrabold tracking-tight text-nx-ink">
            Unity <span className="text-nx-jade-ink">Portal</span>
          </span>
        </Link>

        {/*
          `<nav>` is another landmark. Hidden below `lg`, where four anchors in
          a row would crowd the sign-in button off the screen — the flow rail
          below the header carries the same destinations at every width, so
          nothing is actually lost.
        */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {HEADER_SECTIONS.map((section) => (
              <li key={section.id}>
                <a
                  href={`#${section.id}`}
                  className="rounded-full px-3.5 py-2 text-sm font-medium text-nx-muted transition-colors hover:bg-nx-jade-soft hover:text-nx-jade-ink"
                >
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-1.5">
          {/* The same corner as the signed-in shell, so the control does not
              move the moment somebody signs in. */}
          <ThemeToggle />
          <ActionLink to={ROUTES.LOGIN} size="sm">
            Sign in
          </ActionLink>
        </div>
      </Container>
    </header>
  )
}
