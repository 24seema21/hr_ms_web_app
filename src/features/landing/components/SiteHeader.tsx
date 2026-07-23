import { Link } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { ButtonLink } from '@/shared/components/ui/ButtonLink'
import { ROUTES } from '@/shared/constants/routes'

const NAV_LINKS = [
  { id: 'features', label: 'Features', href: '#features' },
  { id: 'how-it-works', label: 'How it works', href: '#how-it-works' },
] as const

/**
 * `<header>` is a landmark element: screen-reader users can jump straight to
 * it. A `<div className="header">` gives them nothing to jump to.
 */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-ink-200/70 bg-white/85 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link to={ROUTES.HOME} aria-label="HarkHR home">
          <Logo />
        </Link>

        {/*
          `<nav>` is another landmark. The links are hidden below `sm` because
          a cramped row of anchors on a 375px screen is worse than none — the
          same links are repeated in the footer, which stays reachable.
        */}
        <nav aria-label="Main" className="hidden sm:block">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="text-sm font-medium text-ink-600 transition-colors hover:text-ink-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Navigation, so a real <a> that merely looks like a button. */}
        <ButtonLink to={ROUTES.LOGIN} size="sm">
          Sign in
        </ButtonLink>
      </Container>
    </header>
  )
}
