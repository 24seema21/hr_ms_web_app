import { Link } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { ROUTES } from '@/shared/constants/routes'

const FOOTER_LINKS = [
  { id: 'modules', label: 'Modules', href: '#modules' },
  { id: 'rollout', label: 'Rollout', href: '#rollout' },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-shell py-12">
      <Container className="flex flex-col items-center gap-8 sm:flex-row sm:justify-between">
        <div className="flex flex-col items-center gap-2 sm:items-start">
          <Logo />
          <p className="font-mono text-xs text-ink-500">
            HR, payroll and people ops on one record
          </p>
        </div>

        {/*
          The header hides its nav below `sm`; this one does not. Between them
          the section links stay reachable at every viewport width.
        */}
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {FOOTER_LINKS.map((link) => (
              <li key={link.id}>
                <a
                  href={link.href}
                  className="text-sm text-ink-600 transition-colors hover:text-ink-900"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <Link
                to={ROUTES.LOGIN}
                className="text-sm font-medium text-brand-700 transition-colors hover:text-brand-800"
              >
                Sign in
              </Link>
            </li>
          </ul>
        </nav>

        <p className="text-sm text-ink-500">
          {/*
            The year is computed, not hard-coded — otherwise the footer quietly
            goes stale every January.
          */}
          © {new Date().getFullYear()} HarkHR
        </p>
      </Container>
    </footer>
  )
}
