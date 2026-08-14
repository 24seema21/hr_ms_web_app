import { Link } from 'react-router'
import { Container } from '@/shared/components/layout/Container'
import { Logo } from '@/shared/components/ui/Logo'
import { ROUTES } from '@/shared/constants/routes'

const FOOTER_LINKS = [
  { id: 'lifecycle', label: 'Lifecycle', href: '#lifecycle' },
  { id: 'modules', label: 'Modules', href: '#modules' },
  { id: 'tour', label: 'Screens', href: '#tour' },
  { id: 'assist', label: 'AI assist', href: '#assist' },
  { id: 'plans', label: 'Pricing', href: '#plans' },
  { id: 'rollout', label: 'Rollout', href: '#rollout' },
] as const

export function SiteFooter() {
  return (
    <footer className="border-t border-ink-200 bg-shell py-12">
      <Container className="flex flex-col items-center gap-8 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-col items-center gap-2 lg:items-start">
          <Logo />
          <p className="font-mono text-xs text-ink-500">
            The whole employment, on one record
          </p>
          <p className="max-w-xs text-center font-mono text-[0.6875rem] text-pretty text-ink-400 lg:text-left">
            In active development. Modules are labelled live, in build or
            planned, and the labels are kept current.
          </p>
        </div>

        {/*
          The header hides its nav below `sm`; this one does not. Between them
          the section links stay reachable at every viewport width.
        */}
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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

        <p className="text-sm whitespace-nowrap text-ink-500">
          {/*
            The year is computed, not hard-coded — otherwise the footer quietly
            goes stale every January.
          */}
          © {new Date().getFullYear()} Unity Portal
        </p>
      </Container>
    </footer>
  )
}
