import { Link } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ThemeToggle } from '@/shared/components/ui/ThemeToggle'
import { ROUTES } from '@/shared/constants/routes'

const NAV_LINKS = [
  { id: 'modules', label: 'Modules', href: '#modules' },
  { id: 'tour', label: 'Screens', href: '#tour' },
  { id: 'assist', label: 'AI assist', href: '#assist' },
  { id: 'plans', label: 'Pricing', href: '#plans' },
] as const

/**
 * `<header>` is a landmark element: screen-reader users can jump straight to
 * it. A `<div className="header">` gives them nothing to jump to.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/80 bg-paper/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to={ROUTES.HOME} aria-label="Unity Portal home">
          <Logo />
        </Link>

        {/*
          `<nav>` is another landmark. The links are hidden below `lg` because
          a cramped row of four anchors on a 375px screen is worse than none —
          the same links are repeated in the footer, which stays reachable.
        */}
        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="rounded-control px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {/* The same corner as the signed-in shell, so the control does not
              move when somebody signs in. */}
          <ThemeToggle />

          {/* Navigation, so a real <a> that merely looks like a button. */}
          <ButtonLink to={ROUTES.LOGIN} size="sm">
            Sign in
          </ButtonLink>
        </div>
      </Container>
    </header>
  )
}
